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
ORDER=$(curl -s -b $CJ -w '\n%{http_code}' -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":"prod-1","name":"Saffron Silk Kurti","size":"M","qty":1,"price":1899}],"payment_method":"Cash on Delivery","address":{"full_name":"Flow Test","phone":"'"$TEST_PHONE"'","line1":"1 Test St","city":"Mumbai","state":"MH","pincode":"400001","country":"India"}}' \
  $BASE/api/checkout/create-order)
check "create COD order" 200 "$(tail -n1 <<<"$ORDER")"
check "checkout unauthenticated rejected" 401 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"items":[{"productId":"prod-1","name":"x","size":"M","qty":1,"price":1}],"address":{"line1":"a","city":"b"}}' $BASE/api/checkout/create-order)"
check "checkout empty items rejected" 400 "$(status -b $CJ -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"items":[],"address":{"line1":"a","city":"b"}}' $BASE/api/checkout/create-order)"

echo "== Newsletter =="
check "newsletter subscribe" 201 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d "{\"email\":\"news$ts@example.com\"}" $BASE/api/newsletter)"

echo "== Forgot password =="
check "forgot-password (always 200)" 200 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"email":"customer@admireboutique.in"}' $BASE/api/auth/forgot-password)"

echo "== Admin auth & panel =="
curl -s -c $AJ -o /dev/null -X POST -H "$ORIGIN" -H 'Content-Type: application/json' \
  -d '{"email":"owner@admireboutique.in","password":"'"${ADMIN_PASSWORD:?set ADMIN_PASSWORD}"'"}' $BASE/api/admin/login
check "admin login -> me" 200 "$(status -b $AJ $BASE/api/admin/me)"
check "admin login wrong pw" 401 "$(status -X POST -H "$ORIGIN" -H 'Content-Type: application/json' -d '{"email":"owner@admireboutique.in","password":"nope"}' $BASE/api/admin/login)"
check "admin products GET not allowed (uses /api/products)" 405 "$(status -b $AJ $BASE/api/admin/products)"
check "admin orders list" 200 "$(status -b $AJ $BASE/api/admin/orders)"
check "admin customers list" 200 "$(status -b $AJ $BASE/api/admin/customers)"
check "admin endpoint unauth blocked" 401 "$(status $BASE/api/admin/orders)"

echo "== Pages (SSR) =="
for p in / /products /cart /checkout /login /signup /faq /support /wishlist /account /account/orders /forgot-password; do
  check "GET $p" 200 "$(status $BASE$p)"
done
check "GET /orders redirects to /account/orders" "/account/orders" "$(curl -s -o /dev/null -w '%{redirect_url}' $BASE/orders | sed -E 's#^https?://[^/]+##')"

echo
echo "==================================="
echo "RESULTS: PASS=$PASS FAIL=$FAIL"
echo "==================================="
rm -f $CJ $AJ
exit 0
