# Admin Reservations Management Guide

## Overview
The Petuk admin panel now fully supports table reservations management with automatic customer notifications via SMS.

## Accessing Reservations

### From Admin Dashboard:
1. Navigate to `/admin/dashboard`
2. Look for the navigation tabs at the top
3. Click on **"Orders"** tab

### From Orders Page:
1. Go to `/admin/orders`
2. You'll see two tabs:
   - 📦 Food Orders
   - 🍽️ Table Reservations

## Managing Reservations

### View All Reservations
Click the **"🍽️ Table Reservations"** tab to see all reservations.

Each reservation card displays:
- **Reservation ID** - Unique identifier for reference
- **Customer Name** - Name of the person making the reservation
- **Phone Number** - Contact number for the customer
- **Date & Time** - When the customer wants to dine
- **Party Size** - Number of guests
- **Status** - Current status (Pending, Accepted, or Cancelled)
- **Special Requests** - Any notes from the customer
- **Booked At** - When the reservation was made

### Filter Reservations

Use the search and filter options at the top:

**Search Bar**: Find reservations by:
- Customer name
- Phone number
- Reservation ID

**Status Filter**: View reservations by status:
- All Statuses
- Pending
- Accepted
- Cancelled

## Taking Actions on Reservations

### Accept a Reservation (Status: Pending)
1. Find the reservation in the list
2. Click the green **"✓ Accept Reservation"** button
3. System automatically:
   - Updates reservation status to "Accepted"
   - Sends SMS confirmation to customer with all details
   - Logs the action

**Customer Receives:**
```
✅ Your Petuk reservation has been CONFIRMED!
Reservation ID: ABC12345
Date: 2025-12-20
Time: 19:00
Party Size: 4
We look forward to serving you!
```

### Cancel a Reservation
1. Find the reservation in the list
2. Click the red **"✕ Cancel Reservation"** button
3. System automatically:
   - Updates reservation status to "Cancelled"
   - Sends SMS cancellation notice to customer
   - Logs the action

**Customer Receives:**
```
❌ Your Petuk reservation (ID: ABC12345) for 2025-12-20 at 19:00 has been CANCELLED.
Please contact us for more information.
Phone: [ADMIN_PHONE]
```

## Reservation Statuses

| Status | Meaning | Actions Available |
|--------|---------|-------------------|
| **Pending** | Awaiting admin confirmation | Accept, Cancel |
| **Accepted** | Admin has approved | Cancel |
| **Cancelled** | Reservation is cancelled | None (view only) |

## Status Badge Colors

- 🟡 **Yellow** - Pending (awaiting action)
- 🟢 **Green** - Accepted (confirmed)
- 🔴 **Red** - Cancelled (not available)

## Tips for Managing Reservations

1. **Check Regularly** - Log into admin panel daily to manage pending reservations
2. **Act Quickly** - Customers expect confirmation within a few hours
3. **Add Notes** - When cancelling, you can tell customers to call (we'll improve this feature)
4. **Phone Verification** - Always verify customer phone numbers are correct
5. **Special Requests** - Read and note any special requests (high chair, wheelchair access, etc.)

## Troubleshooting

### Reservation Not Showing?
- Check if SMS was received during booking (confirms it was created)
- Refresh the page (F5)
- Check filter - might be hidden by status filter
- Check the browser console for errors

### SMS Not Sending?
- Verify TWILIO credentials are configured in `.env.local`
- Check customer phone number format (should be valid Indian number)
- Check server logs for errors
- Test SMS with `/api/test-sms` endpoint

### Wrong Customer Notified?
- Verify phone number is correct in reservation
- Re-send by cancelling and having customer re-book
- Contact Twilio support if SMS went to wrong number

## Best Practices

✅ **DO:**
- Accept reservations promptly during business hours
- Cancel only when absolutely necessary
- Keep special requests visible while setting up tables
- Cross-reference reservation time with table availability

❌ **DON'T:**
- Leave pending reservations unaddressed for more than 24 hours
- Cancel without good reason (keeps restaurant reputation high)
- Ignore special requests or dietary restrictions
- Accept more reservations than table capacity allows

## Quick Reference

| Task | Steps |
|------|-------|
| **Accept** | Find Reservation → Click Green Button → Done |
| **Cancel** | Find Reservation → Click Red Button → Done |
| **Search** | Type in search box → Results appear instantly |
| **Filter** | Select status from dropdown → Table updates |
| **Refresh** | Click browser refresh or use the page's refresh data button |

## Contact Support

For issues with the reservation system, check:
1. Server console for error messages
2. Twilio dashboard for SMS status
3. Database file integrity (check `data/orders.json`)
