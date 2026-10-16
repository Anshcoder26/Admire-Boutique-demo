#!/usr/bin/env bash
# End-to-end flow smoke test against a running dev server on :3000
set -u
BASE="${BASE:-http://localhost:3000}"
TEST_PHONE="${TEST_PHONE:-9999999999}"
ORIGIN="Origin: $BASE"
CJ=$(mktemp)   # customer cookie jar
AJ=$(mktemp)   # admin cookie jar
PASS=0; FAIL=0
ts=$(date +%s)
CUST_EMAIL="flowtest+$ts@example.com"

check() { # desc expected actual
  if [ "$2" = "$3" ]; then echo "  PASS: $1 ($3)"; PASS=$((PASS+1));
  else echo "  FAIL: $1 (expected $2, got $3)"; FAIL=$((FAIL+1)); fi
}
code() { tail -c 3 <<<"$1"; }   # not used; we use -w

status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "== Public catalog =="
check "GET /api/products" 200 "$(status $BASE/api/products)"
check "GET /api/products/prod-1" 200 "$(status $BASE/api/products/prod-1)"
check "GET /api/products/nonexistent" 404 "$(status $BASE/api/products/does-not-exist)"
check "GET /api/faq" 200 "$(status $BASE/api/faq)"
check "GET /api/health" 200 "$(status $BASE/api/health)"
check "GET /api/instagram/posts" 200 "$(status $BASE/api/instagram/posts)"

echo "== CSRF protection =="
check "cross-origin POST blocked" 403 "$(status -X POST -H 'Origin: http://evil.com' -H 'Content-Type: application/json' -d '{}' $BASE/api/auth/login)"

echo "== Customer signup =="
SIGNUP=$(curl -s -c $CJ -w '\n%{http_code}' -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Flow Test\",\"email\":\"$CUST_EMAIL\",\"phone\":\"$TEST_PHONE\",\"password\":\"StrongPass123!\"}" \
  $BASE/api/auth/signup)
check "signup returns 200" 200 "$(tail -n1 <<<"$SIGNUP")"
WEAK=$(mktemp); printf '{"name":"x","email":"w%s@example.com","phone":"1","password":"weak"}' "$ts" > "$WEAK"
check "signup weak password rejected" 400 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' --data @"$WEAK" $BASE/api/auth/signup)"
DUP=$(mktemp); printf '{"name":"Flow","email":"%s","phone":"%s","password":"StrongPass123!"}' "$CUST_EMAIL" "$TEST_PHONE" > "$DUP"
check "duplicate signup rejected" 409 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' --data @"$DUP" $BASE/api/auth/signup)"
rm -f "$WEAK" "$DUP"

echo "== Customer auth (me/login/logout) =="
check "GET /api/auth/me (authed)" 200 "$(status -b $CJ $BASE/api/auth/me)"
check "logout" 200 "$(status -b $CJ -c $CJ -X POST -H "$ORIGIN" $BASE/api/auth/logout)"
# login with seeded demo customer
curl -s -c $CJ -o /dev/null -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d '{"email":"customer@admireboutique.in","password":"'"${CUSTOMER_PASSWORD:?set CUSTOMER_PASSWORD}"'"}' $BASE/api/auth/login
check "login seeded customer" 200 "$(status -b $CJ $BASE/api/auth/me)"
check "login wrong password" 401 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"email":"customer@admireboutique.in","password":"wrongpass"}' $BASE/api/auth/login)"

echo "== Customer account data =="
check "GET /api/me/orders" 200 "$(status -b $CJ $BASE/api/me/orders)"
check "GET /api/me/addresses" 200 "$(status -b $CJ $BASE/api/me/addresses)"

echo "== Checkout =="
# Orders need RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET set on the server (fake test keys are fine;
# create-order only checks they exist). Cash on Delivery is not offered.
# Admin session (used here and in the admin section below).
curl -s -c $AJ -o /dev/null -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d '{"email":"owner@admireboutique.in","password":"'"${ADMIN_PASSWORD:?set ADMIN_PASSWORD}"'"}' $BASE/api/admin/login
# Order a throwaway product so repeated runs never use up real stock.
TEST_PRODUCT=$(curl -s -b $AJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d "$(printf '{"name":"Flow Test Kurti %s","category":"Kurtis","price":999,"stock":1,"notifySubscribers":false}' "$ts")" \
  $BASE/api/admin/products)
TP_ID=$(node -e 'const d=JSON.parse(process.argv[1]);process.stdout.write((d.product&&d.product.id)||d.id||"")' "$TEST_PRODUCT")
check "test product created" yes "$([ -n "$TP_ID" ] && echo yes || echo no)"
ORDER_BODY=$(printf '{"items":[{"productId":"%s","name":"Flow Test Kurti %s","size":"M","qty":1,"price":999}],"payment_method":"Razorpay","address":{"full_name":"Flow Test","phone":"%s","line1":"1 Test St","city":"Mumbai","state":"MH","pincode":"400001","country":"India"}}' "$TP_ID" "$ts" "$TEST_PHONE")
COD_BODY=${ORDER_BODY/\"payment_method\":\"Razorpay\"/\"payment_method\":\"Cash on Delivery\"}
NO_METHOD_BODY=${ORDER_BODY/\"payment_method\":\"Razorpay\",/}
check "Cash on Delivery order rejected" 400 "$(status -b $CJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "$COD_BODY" $BASE/api/checkout/create-order)"
check "order without a payment method rejected" 400 "$(status -b $CJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "$NO_METHOD_BODY" $BASE/api/checkout/create-order)"
check "rejected orders left the stock alone" 1 "$(curl -s $BASE/api/products/$TP_ID | node -e 'const d=JSON.parse(require("fs").readFileSync(0));const p=d.product||d;process.stdout.write(String(p.stock))')"
ORDER=$(curl -s -b $CJ -w '\n%{http_code}' -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "$ORDER_BODY" $BASE/api/checkout/create-order)
check "create online order" 200 "$(tail -n1 <<<"$ORDER")"
check "online order awaits payment" "Awaiting Payment" "$(node -e 'const d=JSON.parse(process.argv[1]);process.stdout.write((d.order&&d.order.status)||"")' "$(head -n1 <<<"$ORDER")")"
check "order took the last unit of stock" 0 "$(curl -s $BASE/api/products/$TP_ID | node -e 'const d=JSON.parse(require("fs").readFileSync(0));const p=d.product||d;process.stdout.write(String(p.stock))')"
# A second order from the same customer would cancel their unpaid one and free the
# stock, so the sold-out check uses the customer who signed up above.
SJ=$(mktemp)
curl -s -c $SJ -o /dev/null -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$CUST_EMAIL\",\"password\":\"StrongPass123!\"}" $BASE/api/auth/login
check "ordering a sold-out product rejected" 409 "$(status -b $SJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "$ORDER_BODY" $BASE/api/checkout/create-order)"
check "test product deleted" 200 "$(status -b $AJ -X DELETE -H "$ORIGIN" $BASE/api/admin/products/$TP_ID)"
check "checkout unauthenticated rejected" 401 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"items":[{"productId":"prod-1","name":"x","size":"M","qty":1,"price":1}],"address":{"line1":"a","city":"b"}}' $BASE/api/checkout/create-order)"
check "checkout empty items rejected" 400 "$(status -b $CJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"items":[],"address":{"line1":"a","city":"b"}}' $BASE/api/checkout/create-order)"

echo "== Newsletter =="
check "newsletter subscribe" 201 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "{\"email\":\"news$ts@example.com\"}" $BASE/api/newsletter)"

echo "== Forgot password =="
check "forgot-password (always 200)" 200 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"email":"customer@admireboutique.in"}' $BASE/api/auth/forgot-password)"

echo "== Admin auth & panel =="
check "admin login -> me" 200 "$(status -b $AJ $BASE/api/admin/me)"
check "admin login wrong pw" 401 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"email":"owner@admireboutique.in","password":"nope"}' $BASE/api/admin/login)"
check "admin products GET not allowed (uses /api/products)" 405 "$(status -b $AJ $BASE/api/admin/products)"
check "admin orders list" 200 "$(status -b $AJ $BASE/api/admin/orders)"
check "admin customers list" 200 "$(status -b $AJ $BASE/api/admin/customers)"
check "admin endpoint unauth blocked" 401 "$(status $BASE/api/admin/orders)"
ADMIN_ORDERS=$(curl -s -b $AJ $BASE/api/admin/orders)
A_ORDER_ID=$(node -e 'const d=JSON.parse(process.argv[1]);const o=(d.orders||[]).find(x=>["Confirmed","Packed","Shipped","Delivered"].includes(x.status));process.stdout.write(o?o.id+" "+o.status:"")' "$ADMIN_ORDERS")
A_ORDER_STATUS=${A_ORDER_ID#* }; A_ORDER_ID=${A_ORDER_ID%% *}
admin_put() { status -b $AJ -X PUT -H "$ORIGIN" -H 'Content-Type: application/json' -d "$1" $BASE/api/admin/orders; }
BODY_CANCEL=$(printf '{"orderId":"%s","status":"Cancelled"}' "$A_ORDER_ID")
BODY_BAD_STATUS=$(printf '{"orderId":"%s","status":"Lost"}' "$A_ORDER_ID")
BODY_BAD_PAYMENT=$(printf '{"orderId":"%s","paymentStatus":"Chargeback"}' "$A_ORDER_ID")
check "admin cannot cancel an order" 400 "$(admin_put "$BODY_CANCEL")"
check "admin cannot set an unknown status" 400 "$(admin_put "$BODY_BAD_STATUS")"
check "admin cannot set an unknown payment status" 400 "$(admin_put "$BODY_BAD_PAYMENT")"
check "admin update of missing order" 404 "$(admin_put '{"orderId":"does-not-exist","status":"Packed"}')"
check "rejected updates left the order unchanged" "$A_ORDER_STATUS" "$(curl -s -b $AJ $BASE/api/admin/orders | node -e 'const d=JSON.parse(require("fs").readFileSync(0));process.stdout.write((d.orders||[]).find(x=>x.id===process.argv[1])?.status||"")' "$A_ORDER_ID")"

echo "== Pages (SSR) =="
for p in / /products /cart /checkout /login /signup /faq /support /wishlist /account /account/orders /forgot-password; do
  check "GET $p" 200 "$(status $BASE$p)"
done
check "GET /orders redirects to /account/orders" "/account/orders" "$(curl -s -o /dev/null -w '%{redirect_url}' $BASE/orders | sed -E 's#^https?://[^/]+##')"

echo "== Policy pages & footer links =="
HOME_HTML=$(curl -s $BASE/)
for p in /privacy-policy /terms /refund-policy /shipping-policy /contact; do
  check "GET $p" 200 "$(status $BASE$p)"
  check "footer links to $p" 1 "$(grep -c "href=\"$p\"" <<<"$HOME_HTML" | tr -d ' ' | sed 's/^[1-9][0-9]*$/1/')"
done
check "no dead href=\"#\" links on home page" 0 "$(grep -o 'href="#"' <<<"$HOME_HTML" | wc -l | tr -d ' ')"

has() { grep -qF "$1" <<<"$2" && echo yes || echo no; }
echo "== No Cash on Delivery on policy pages =="
for p in /shipping-policy /refund-policy /terms; do
  check "$p: no Cash on Delivery" no "$(has 'Cash on Delivery' "$(curl -s $BASE$p)")"
done
check "/terms: online payments only" yes "$(has 'We accept online payments only' "$(curl -s $BASE/terms)")"

echo "== Refund policy (no cancellations, exchange on issues only) =="
REFUND_HTML=$(curl -s $BASE/refund-policy)
check "refund policy: orders cannot be cancelled" yes "$(has 'Orders cannot be cancelled once they are placed.' "$REFUND_HTML")"
check "refund policy: unboxing video required" yes "$(has 'Record an unboxing video' "$REFUND_HTML")"
check "refund policy: 24-hour complaint window" yes "$(has 'within 24 hours of delivery' "$REFUND_HTML")"
check "refund policy: no old 7-day return window" no "$(has '7 days of delivery' "$REFUND_HTML")"
check "refund policy: no customer cancellation before shipping" no "$(has 'cancel an order any time before it is shipped' "$REFUND_HTML")"

echo "== No return / money-back claims on storefront =="
HOME_NOW=$(curl -s $BASE/)
SLUG=$(curl -s $BASE/api/products | node -e 'const d=JSON.parse(require("fs").readFileSync(0));const a=Array.isArray(d)?d:(d.products||[]);process.stdout.write(a[0]?.slug||"")')
PRODUCT_HTML=$(curl -s "$BASE/products/$SLUG")
check "home banner offers exchange on damaged/wrong items" yes "$(has 'exchange on damaged or wrong items' "$HOME_NOW")"
check "home: no 7-day returns claim" no "$(has '7-day returns' "$HOME_NOW")"
check "product page ($SLUG) shows exchange badge" yes "$(has 'For damaged or wrong items' "$PRODUCT_HTML")"
check "product page: no 7-day returns claim" no "$(has '7-Day Returns' "$PRODUCT_HTML")"
check "product page: no money-back guarantee claim" no "$(has 'money-back' "$PRODUCT_HTML")"
FAQ_JSON=$(curl -s $BASE/api/faq)
check "FAQ: no 7-day returns promise" no "$(has 'within 7 days of delivery' "$FAQ_JSON")"
check "FAQ: exchange needs unboxing video within 24 hours" yes "$(has 'unboxing video and message us on WhatsApp within 24 hours of delivery' "$FAQ_JSON")"
check "FAQ: sizing answer says suits are unstitched" yes "$(has 'Our suits are unstitched, so there is no particular size to them.' "$FAQ_JSON")"
check "FAQ: no size chart reference" no "$(has 'size chart' "$FAQ_JSON")"
check "FAQ: no Cash on Delivery" no "$(has 'Cash on Delivery' "$FAQ_JSON")"
check "FAQ: online payments only" yes "$(has 'We accept online payments only' "$FAQ_JSON")"

echo
echo "==================================="
echo "RESULTS: PASS=$PASS FAIL=$FAIL"
echo "==================================="
rm -f $CJ $AJ $SJ
[ "$FAIL" -eq 0 ] || exit 1
exit 0
