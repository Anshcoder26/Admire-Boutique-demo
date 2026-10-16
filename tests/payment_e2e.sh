#!/usr/bin/env bash
# Payment-failure end-to-end test against a local dev server on :3000.
#
# Start the stand-in email/WhatsApp servers and the app with test payment settings:
#   node tests/sinks.mjs /tmp/pay-e2e
#   PAYMENT_WINDOW_MINUTES=0.25 RAZORPAY_KEY_ID=rzp_test_fake RAZORPAY_KEY_SECRET=fakesecret123 \
#   RAZORPAY_WEBHOOK_SECRET=whsec_test SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_SECURE=false \
#   SMTP_USER=test SMTP_PASS=test SMTP_FROM=shop@test.local ADMIN_EMAIL=owner@test.local \
#   WHATSAPP_ACCESS_TOKEN=fake WHATSAPP_PHONE_NUMBER_ID=123 WHATSAPP_API_BASE_URL=http://127.0.0.1:4010 \
#   npx next dev
# Then:
#   CUSTOMER_PASSWORD=... ADMIN_PASSWORD=... bash tests/payment_e2e.sh
#
# Orders a throwaway product (deleted at the end), so real stock is never used.
# DB access: SQLite (default) or Postgres when PG_URL is set.
set -u
BASE="${BASE:-http://localhost:3000}"; O="Origin: $BASE"; J="Content-Type: application/json"
SECRET=fakesecret123; WHSEC=whsec_test
SINK_DIR="${SINK_DIR:-/tmp/pay-e2e}"
TEST_PHONE="${TEST_PHONE:-9999999999}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
T=$(mktemp -d); C1=$T/c1; C2=$T/c2; CA=$T/ca
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  PASS $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  FAIL $1"; }
check(){ if [ "$2" == "$3" ]; then ok "$1 ($2)"; else bad "$1: got '$2' want '$3'"; fi; }

q() { # run SQL, print rows as a|b
  if [ -n "${PG_URL:-}" ]; then
    (cd "$APP_DIR" && PG_URL="$PG_URL" SQL="$1" node -e '
      const {Client}=require("pg");const c=new Client({connectionString:process.env.PG_URL});
      c.connect().then(()=>c.query(process.env.SQL)).then(r=>{for(const row of r.rows||[])console.log(Object.values(row).join("|"));return c.end();})
       .catch(e=>{console.error(e.message);process.exit(1)})')
  else
    sqlite3 "$APP_DIR/data/admire_boutique.db" "$1"
  fi
}
notes() { ls "$SINK_DIR" 2>/dev/null | wc -l | tr -d ' '; }
stock() { q "SELECT stock FROM products WHERE id='$PROD'"; }
state() { q "SELECT status || '/' || payment_status FROM orders WHERE id='$1'"; }
json()  { node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')||'{}');console.log($1)"; }

login() { printf '{"email":"%s","password":"%s"}' "$2" "$3" > $T/l.json
  curl -s -o /dev/null -w '%{http_code}' -c "$1" -H "$O" -H "$J" --data @$T/l.json "$BASE$4"; }

ADDR=$(printf '{"full_name":"Payment Test","phone":"%s","line1":"1 Test St","city":"Agra","state":"UP","pincode":"282001","country":"India"}' "$TEST_PHONE")
mk_order() { # $1 cookie, $2 method -> prints order id
  printf '{"items":[{"productId":"%s","name":"x","size":"M","qty":1,"price":1}],"payment_method":"%s","address":%s}' "$PROD" "$2" "$ADDR" > $T/o.json
  curl -s -b "$1" -H "$O" -H "$J" --data @$T/o.json $BASE/api/checkout/create-order | json 'd.order?d.order.id:"ERR "+JSON.stringify(d)'; }
retry() { printf '{"order_id":"%s"}' "$2" > $T/r.json
  curl -s -w '\n%{http_code}' -b "$1" -H "$O" -H "$J" --data @$T/r.json $BASE/api/checkout/razorpay; }
verify() { # cookie, order id, rzp order id, payment id, [signature]
  local sig=${5:-$(printf '%s|%s' "$3" "$4" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')}
  printf '{"order_id":"%s","razorpay_order_id":"%s","razorpay_payment_id":"%s","razorpay_signature":"%s"}' "$2" "$3" "$4" "$sig" > $T/v.json
  curl -s -w '\n%{http_code}' -b "$1" -H "$O" -H "$J" --data @$T/v.json $BASE/api/checkout/razorpay/verify; }
webhook() { # event, rzp order id, payment id, [secret]
  printf '{"event":"%s","payload":{"payment":{"entity":{"id":"%s","order_id":"%s","status":"captured"}}}}' "$1" "$3" "$2" > $T/w.json
  local sig=$(openssl dgst -sha256 -hmac "${4:-$WHSEC}" < $T/w.json | awk '{print $NF}')
  curl -s -w '\n%{http_code}' -H "$J" -H "X-Razorpay-Signature: $sig" --data-binary @$T/w.json $BASE/api/webhooks/razorpay; }
code() { tail -n1; }
wait_expiry() { echo "  ...waiting ${1}s for payment window to pass"; sleep "$1"; }
sweep() { curl -s -o /dev/null $BASE/api/products; }
RUN=$(date +%s)

echo "== Setup =="
check "customer login" "$(login $C1 customer@admireboutique.in "${CUSTOMER_PASSWORD:?set CUSTOMER_PASSWORD}" /api/auth/login)" "200"
printf '{"name":"Payment Test","email":"paytest+%s@example.com","phone":"%s","password":"StrongPass123!"}' "$RUN" "$TEST_PHONE" > $T/s.json
check "second customer signup" "$(curl -s -o /dev/null -w '%{http_code}' -c $C2 -H "$O" -H "$J" --data @$T/s.json $BASE/api/auth/signup)" "200"
check "admin login" "$(login $CA owner@admireboutique.in "${ADMIN_PASSWORD:?set ADMIN_PASSWORD}" /api/admin/login)" "200"
printf '{"name":"Payment Test Kurti %s","category":"Kurtis","price":999,"stock":20,"notifySubscribers":false}' "$RUN" > $T/p.json
PROD=$(curl -s -b $CA -H "$O" -H "$J" --data @$T/p.json $BASE/api/admin/products | json '(d.product&&d.product.id)||d.id||""')
check "throwaway product created" "$([ -n "$PROD" ] && echo yes || echo no)" "yes"

echo; echo "== 1. Online order is created as Awaiting Payment, holds stock, no notification yet =="
S0=$(stock); N0=$(notes)
O1=$(mk_order $C1 Razorpay)
check "status" "$(state $O1)" "Awaiting Payment/Pending"
check "expiry set" "$(q "SELECT CASE WHEN payment_expires_at IS NOT NULL THEN 'yes' ELSE 'no' END FROM orders WHERE id='$O1'")" "yes"
check "stock held" "$(stock)" "$((S0-1))"
sleep 3; check "no notification for unpaid order" "$(notes)" "$N0"

echo; echo "== 2. Failed payment attempt -> order unchanged, retry reuses the same Razorpay order =="
q "UPDATE orders SET razorpay_order_id='order_e2e_${RUN}_1' WHERE id='$O1'" >/dev/null
check "tampered signature rejected" "$(verify $C1 $O1 order_e2e_${RUN}_1 pay_x deadbeef | code)" "400"
check "still awaiting" "$(state $O1)" "Awaiting Payment/Pending"
R=$(retry $C1 $O1)
check "retry endpoint" "$(echo "$R" | code)" "200"
check "same razorpay order reused" "$(echo "$R" | head -n1 | json d.razorpay_order_id)" "order_e2e_${RUN}_1"
check "seconds_left > 0" "$(echo "$R" | head -n1 | json 'd.seconds_left>0')" "true"
check "other customer can't retry it" "$(retry $C2 $O1 | code)" "404"
check "other customer can't verify it" "$(verify $C2 $O1 order_e2e_${RUN}_1 pay_${RUN}_1 | code)" "404"

echo; echo "== 3. Successful retry -> Confirmed/Paid, one receipt, no duplicate order =="
N0=$(notes); COUNT0=$(q "SELECT COUNT(*) FROM orders")
check "verify" "$(verify $C1 $O1 order_e2e_${RUN}_1 pay_${RUN}_1 | code)" "200"
check "status" "$(state $O1)" "Confirmed/Paid"
check "verify again is idempotent" "$(verify $C1 $O1 order_e2e_${RUN}_1 pay_${RUN}_1 | code)" "200"
check "retry on a paid order" "$(retry $C1 $O1 | code)" "409"
sleep 6
check "receipt sent once (customer email+WhatsApp+owner email)" "$(( $(notes) - N0 ))" "3"
check "no duplicate orders" "$(q "SELECT COUNT(*) FROM orders")" "$COUNT0"
check "stock (1 sold)" "$(stock)" "$((S0-1))"

echo; echo "== 4. New checkout replaces an earlier unpaid attempt (stock released) =="
S1=$(stock)
O2=$(mk_order $C1 Razorpay); check "first attempt holds stock" "$(stock)" "$((S1-1))"
O3=$(mk_order $C1 Razorpay)
check "earlier attempt cancelled" "$(state $O2)" "Cancelled/Failed"
check "only one unit held" "$(stock)" "$((S1-1))"

echo; echo "== 5. Abandoned payment -> auto-cancelled after the window, stock restored =="
q "UPDATE orders SET razorpay_order_id='order_e2e_${RUN}_3' WHERE id='$O3'" >/dev/null
wait_expiry 17; sweep
check "expired order cancelled" "$(state $O3)" "Cancelled/Failed"
check "stock restored" "$(stock)" "$S1"
R=$(retry $C1 $O3)
check "retry after expiry" "$(echo "$R" | code)" "410"
check "expired flag" "$(echo "$R" | head -n1 | json d.expired)" "true"

echo; echo "== 6. Payment arrives after cancellation, stock available -> order revived =="
N0=$(notes)
check "late verify" "$(verify $C1 $O3 order_e2e_${RUN}_3 pay_${RUN}_3 | code)" "200"
check "revived" "$(state $O3)" "Confirmed/Paid"
check "stock re-reserved" "$(stock)" "$((S1-1))"
sleep 6; check "receipt sent" "$(( $(notes) - N0 ))" "3"

echo; echo "== 7. Payment arrives after cancellation, sold out -> Refund Due (webhook path) =="
O4=$(mk_order $C1 Razorpay)
q "UPDATE orders SET razorpay_order_id='order_e2e_${RUN}_4' WHERE id='$O4'" >/dev/null
wait_expiry 17; sweep
check "cancelled" "$(state $O4)" "Cancelled/Failed"
S2=$(stock); q "UPDATE products SET stock=0 WHERE id='$PROD'" >/dev/null
N0=$(notes)
W=$(webhook payment.captured order_e2e_${RUN}_4 pay_${RUN}_4)
check "webhook accepted" "$(echo "$W" | code)" "200"
check "outcome" "$(echo "$W" | head -n1 | json d.outcome)" "refund_due"
check "state" "$(state $O4)" "Cancelled/Refund Due"
check "stock untouched" "$(stock)" "0"
check "customer verify reports refund" "$(verify $C1 $O4 order_e2e_${RUN}_4 pay_${RUN}_4 | head -n1 | json d.refund_due)" "true"
sleep 6
check "owner + customer emailed" "$(( $(notes) - N0 ))" "2"
grep -l "owner@test.local" $(ls -t $SINK_DIR/mail-*.eml | head -2) >/dev/null 2>&1 && ok "owner alert addressed to ADMIN_EMAIL" || bad "owner alert missing"
q "UPDATE products SET stock=$S2 WHERE id='$PROD'" >/dev/null

echo; echo "== 8. Webhook: auth, idempotency, and racing the browser callback =="
O5=$(mk_order $C1 Razorpay)
q "UPDATE orders SET razorpay_order_id='order_e2e_${RUN}_5' WHERE id='$O5'" >/dev/null
check "bad signature" "$(webhook payment.captured order_e2e_${RUN}_5 pay_${RUN}_5 wrongsecret | code)" "401"
check "still awaiting" "$(state $O5)" "Awaiting Payment/Pending"
check "unrelated event ignored" "$(webhook payment.failed order_e2e_${RUN}_5 pay_${RUN}_5 | head -n1 | json d.ignored)" "true"
check "unknown order ignored" "$(webhook payment.captured order_unknown pay_unknown | head -n1 | json d.ignored)" "true"
N0=$(notes)
check "webhook marks paid" "$(webhook payment.captured order_e2e_${RUN}_5 pay_${RUN}_5 | head -n1 | json d.outcome)" "paid"
check "order.paid duplicate" "$(webhook order.paid order_e2e_${RUN}_5 pay_${RUN}_5 | head -n1 | json d.outcome)" "already_processed"
check "browser callback after webhook" "$(verify $C1 $O5 order_e2e_${RUN}_5 pay_${RUN}_5 | code)" "200"
check "state" "$(state $O5)" "Confirmed/Paid"
sleep 6; check "exactly one receipt" "$(( $(notes) - N0 ))" "3"
q "UPDATE orders SET razorpay_order_id='order_e2e_${RUN}_6' WHERE id='$O5'" >/dev/null 2>&1
check "webhook spoof without header" "$(curl -s -o /dev/null -w '%{http_code}' -H "$J" --data-binary @$T/w.json $BASE/api/webhooks/razorpay)" "401"

echo; echo "== 9. Cash on Delivery is not accepted and leaves the unpaid attempt alone =="
O6=$(mk_order $C1 Razorpay); S6=$(stock); N0=$(notes)
printf '{"items":[{"productId":"%s","name":"x","size":"M","qty":1,"price":1}],"payment_method":"Cash on Delivery","address":%s}' "$PROD" "$ADDR" > $T/o.json
check "COD order rejected" "$(curl -s -o /dev/null -w '%{http_code}' -b $C1 -H "$O" -H "$J" --data @$T/o.json $BASE/api/checkout/create-order)" "400"
check "unpaid attempt still awaiting" "$(state $O6)" "Awaiting Payment/Pending"
check "stock unchanged" "$(stock)" "$S6"
sleep 3; check "no notification sent" "$(notes)" "$N0"

echo; echo "== 10. Admin stats ignore unpaid/cancelled orders =="
O8=$(mk_order $C2 Razorpay)
STATS=$(curl -s -b $CA $BASE/api/admin/orders | json 'JSON.stringify(d.stats)')
EXP=$(q "SELECT COUNT(*) FROM orders WHERE status NOT IN ('Awaiting Payment') AND payment_status <> 'Failed'")
check "order count" "$(echo "$STATS" | json d.orders)" "$EXP"
check "awaiting order listed for admin" "$(curl -s -b $CA $BASE/api/admin/orders | json "(d.orders||d.rows||[]).some(o=>o.id==='$O8'&&o.status==='Awaiting Payment')")" "true"
check "customer sees awaiting status" "$(curl -s -b $C2 "$BASE/api/me/orders?id=$O8" | json d.order.status)" "awaiting_payment"

echo; echo "== Cleanup =="
check "throwaway product deleted" "$(curl -s -o /dev/null -w '%{http_code}' -b $CA -H "$O" -X DELETE $BASE/api/admin/products/$PROD)" "200"

echo; echo "RESULT: $PASS passed, $FAIL failed"
rm -rf $T
[ "$FAIL" -eq 0 ] || exit 1
exit 0
