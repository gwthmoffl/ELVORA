# ELVORA — Complete E-commerce

 builds on the ELVORA storefront and adds a stronger production workflow: real Supabase auth/database, customer profiles, orders, admin dashboard, stock controls, order-status management, customer enable/disable, coupons/discounts, product image uploads, Razorpay-ready checkout and Vercel deployment.

## What is included
- Existing ELVORA visual storefront preserved
- Product details + cart + persistent bag
- Supabase authentication and profiles
- Product catalogue synced from Supabase
- Admin dashboard with product counts, order counts, customers and coupons
- Product add/edit/hide/show
- Product stock +/− controls
- Product image upload to Supabase Storage bucket `product-images`
- Order status: placed → confirmed → packed → shipped → delivered / cancelled
- Customer enable/disable
- Coupon creation and checkout validation
- `WELCOME10` starter coupon
- Razorpay server-side order creation + signature verification
- Responsive mobile/tablet/desktop UI

## Setup
1. Create a Supabase project.
2. Run `supabase/schema-v5.sql` in Supabase SQL Editor.
3. In Supabase Storage, create a **public** bucket named `product-images`.
4. Add Storage policies so authenticated admins can insert/update/delete objects and public users can read objects. Keep the bucket public only if you want product image URLs to work directly in the storefront.
5. Put your Supabase URL and anon key in `supabase-config.js` or environment/build configuration appropriate to your deployment.
6. Create a normal customer account.
7. Promote that account to admin:
   `update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';`
8. For Razorpay, add these Vercel environment variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_CURRENCY=INR`
9. Deploy the folder to Vercel.

## Important production note
The browser should never receive `RAZORPAY_KEY_SECRET`. The included `/api` functions keep that secret server-side.

For high-volume production, replace client-side stock decrement/coupon usage updates with a single server-side transaction/RPC to make inventory and coupon redemption fully atomic under concurrent checkout.

## Admin
After promoting a user to admin, sign in and open the subtle `A` control at the bottom-right. The dashboard provides product, stock, order-status, customer and coupon management.
