// src/emailService.ts
import type { Order } from "./types";

export const MYA_EMAIL = "muncheezbymya@gmail.com";

/**
 * Formats an order's items grouped by Dozen Box (#1, #2, etc.)
 */
export function formatOrderBoxesForEmail(order: Order): Record<string, string> {
  const grouped: Record<number, string[]> = {};

  order.items.forEach((item) => {
    const boxNum = item.boxNumber || 1;
    if (!grouped[boxNum]) grouped[boxNum] = [];
    grouped[boxNum].push(`${item.qty}x ${item.name}`);
  });

  const formattedBoxes: Record<string, string> = {};
  Object.entries(grouped).forEach(([boxNum, list]) => {
    formattedBoxes[`Dozen_Box_${boxNum}`] = list.join(", ");
  });

  return formattedBoxes;
}

/**
 * Seamlessly dispatches a formatted order email directly to muncheezbymya@gmail.com
 * using FormSubmit AJAX (no backend or API key required).
 */
export async function sendOrderEmailToMya(order: Order): Promise<boolean> {
  const boxBreakdown = formatOrderBoxesForEmail(order);

  const payload: Record<string, string> = {
    _subject: `🍪 New Cookie Order ${order.id} — $${order.total.toFixed(2)} (${order.customerName})`,
    _template: "table",
    _captcha: "false",
    _replyto: order.email,
    Order_ID: order.id,
    Order_Status: "Awaiting Payment (24-Hour Window)",
    Total_Due: `$${order.total.toFixed(2)}`,
    Payment_Method: order.paymentMethod,
    Customer_Name: order.customerName,
    Customer_Phone: order.phone,
    Customer_Email: order.email,
    Fulfillment_Type: order.fulfillment.toUpperCase(),
    Scheduled_Date: order.scheduledDate,
    Scheduled_Time: order.scheduledTime,
    Pickup_Or_Delivery_Address: order.address,
    ...boxBreakdown,
    Store_Policies_Accepted:
      "Yes (12-Cookie Min, 3 Flavors/Dozen, 48h Lead, 24h Payment, 15m Pickup Grace Period)",
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${MYA_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === "true" || data.success === true || response.ok;
  } catch (error) {
    console.error("Failed to dispatch order email to Mya:", error);
    return false;
  }
}

/**
 * Generates a pre-filled Gmail compose URL so Mya can email a customer in 1 click
 * from her Admin Panel (for 24hr confirmation, payment receipt, or 15m grace period notice).
 */
export function buildCustomerGmailComposeUrl(order: Order): string {
  const itemsText = order.items
    .map(
      (i) => `${i.boxNumber ? `[Dozen #${i.boxNumber}] ` : ""}${i.qty}x ${i.name}`
    )
    .join(", ");

  let subject = `MuncheezByMya Order ${order.id} Update`;
  let body = `Hi ${order.customerName},\n\n`;

  if (order.status === "payment_pending") {
    subject = `Action Required: Payment Due Within 24hrs for MuncheezByMya Order ${order.id}`;
    body += `Thank you for ordering from MuncheezByMya! Your order (${order.id}) for ${itemsText} is reserved.\n\nPlease remember to send your total of $${order.total.toFixed(
      2
    )} via ${
      order.paymentMethod
    } within 24 hours of placing your order and include "${
      order.id
    }" in the payment note.\n\nScheduled ${order.fulfillment.toUpperCase()}: ${
      order.scheduledDate
    } at ${order.scheduledTime}\n\nThank you,\nMya | MuncheezByMya NYC`;
  } else if (order.status === "confirmed_24h") {
    subject = `24-Hour Confirmation: MuncheezByMya Order ${order.id} Tomorrow!`;
    body += `This is your 24-hour confirmation check-in from Mya! Your fresh cookies (${itemsText}) are scheduled for ${order.fulfillment.toUpperCase()} tomorrow (${
      order.scheduledDate
    }) at ${
      order.scheduledTime
    }.\n\nLocation / Address: ${
      order.address
    }\n\nReminder: Pickup orders have a 15-minute grace period from your scheduled pickup time.\n\nSee you tomorrow!\nMya | MuncheezByMya NYC`;
  } else if (order.status === "grace_period_missed") {
    subject = `URGENT: Missed Pickup Window — Next-Day Final Hold for Order ${order.id}`;
    body += `We missed you during your 15-minute pickup grace period today for Order ${order.id}.\n\nPer MuncheezByMya policy, please reply to arrange pickup for tomorrow. If the order is still not picked up tomorrow, it will be cancelled without refund.\n\nBest,\nMya | MuncheezByMya NYC`;
  } else {
    body += `Here is an update on your MuncheezByMya order (${order.id}):\n\nCurrent Status: ${order.status
      .replace(/_/g, " ")
      .toUpperCase()}\nScheduled: ${order.scheduledDate} at ${
      order.scheduledTime
    }\nItems: ${itemsText}\n${
      order.trackingNumber ? `Tracking / Note: ${order.trackingNumber}\n` : ""
    }\nThank you for supporting MuncheezByMya!\nMya | MuncheezByMya NYC`;
  }

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: order.email,
    su: subject,
    body: body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}