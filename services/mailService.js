const nodemailer = require('nodemailer');

const trustName = process.env.TRUST_NAME || 'Shree Manvat Baba Mahashiv Mandir Trust';
const trustEmail = process.env.TRUST_EMAIL || process.env.MAIL_FROM || 'mahashivmandirtrusts@gmail.com';
const trustPhone = process.env.TRUST_PHONE || '';
const trustAddress = process.env.TRUST_ADDRESS || '';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(amount || 0));

const formatPdfCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).format(new Date(date || Date.now()));

const getReceiptNumber = (donation) => `SMB-${String(donation._id).slice(-8).toUpperCase()}`;

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const buildDonationReceiptHtml = (donation) => {
  const receiptNo = getReceiptNumber(donation);
  const donorName = escapeHtml(donation.name);
  const category = escapeHtml(donation.category);
  const paymentMode = escapeHtml(donation.paymentMode || 'UPI');
  const utr = escapeHtml(donation.utr || 'N/A');
  const amount = formatCurrency(donation.amount);
  const donatedOn = formatDate(donation.createdAt);
  const safeTrustName = escapeHtml(trustName);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Donation Receipt</title>
  </head>
  <body style="margin:0;background:#fff7ed;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;">Your donation has been approved. Receipt ${receiptNo} is included.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #fed7aa;box-shadow:0 14px 40px rgba(154,52,18,0.12);">
            <tr>
              <td style="background:#ff6b00;padding:26px 28px;text-align:center;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Donation Approved</div>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.25;">Thank you, ${donorName}</h1>
                <p style="margin:10px 0 0;font-size:15px;line-height:1.6;">Your generous contribution has been received by ${safeTrustName}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:2px solid #ff6b00;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="padding:22px;text-align:center;background:#fffaf5;border-bottom:1px solid #fed7aa;">
                      <div style="font-size:12px;color:#9a3412;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Official Donation Receipt</div>
                      <div style="margin-top:6px;font-size:13px;color:#64748b;">Receipt No: ${receiptNo}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:13px;">Donor Name</td>
                          <td align="right" style="padding:10px 0;font-weight:700;font-size:14px;">${donorName}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Category</td>
                          <td align="right" style="padding:10px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;">${category}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Payment Mode</td>
                          <td align="right" style="padding:10px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;">${paymentMode}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Transaction ID</td>
                          <td align="right" style="padding:10px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;">${utr}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Donation Date</td>
                          <td align="right" style="padding:10px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;">${donatedOn}</td>
                        </tr>
                      </table>
                      <div style="margin-top:22px;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:18px;text-align:center;">
                        <div style="font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Amount Received</div>
                        <div style="margin-top:6px;font-size:34px;line-height:1;font-weight:800;color:#ff6b00;">${amount}</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0 0;color:#475569;font-size:14px;line-height:1.7;text-align:center;">
                  May your kindness bring peace, prosperity, and blessings to your family.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:18px 28px;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                <strong style="color:#334155;">${safeTrustName}</strong><br />
                ${escapeHtml(trustAddress)}${trustAddress ? '<br />' : ''}
                ${trustPhone ? `Phone: ${escapeHtml(trustPhone)}<br />` : ''}
                Email: ${escapeHtml(trustEmail)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildDonationReceiptText = (donation) => [
  `${trustName} - Donation Receipt`,
  `Receipt No: ${getReceiptNumber(donation)}`,
  `Donor: ${donation.name}`,
  `Amount: ${formatCurrency(donation.amount)}`,
  `Category: ${donation.category}`,
  `Payment Mode: ${donation.paymentMode || 'UPI'}`,
  `Transaction ID: ${donation.utr || 'N/A'}`,
  `Date: ${formatDate(donation.createdAt)}`,
  '',
  'Thank you for your generous donation.'
].join('\n');

const escapePdfText = (value = '') => String(value)
  .replace(/[^\x20-\x7E]/g, '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const pdfText = (text, x, y, size = 11, font = 'F1', color = '0.10 0.14 0.22') =>
  `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;

const pdfLine = (x1, y1, x2, y2, color = '0.89 0.91 0.94') =>
  `q ${color} RG 1 w ${x1} ${y1} m ${x2} ${y2} l S Q`;

const pdfRect = (x, y, width, height, color) =>
  `q ${color} rg ${x} ${y} ${width} ${height} re f Q`;

const buildDonationReceiptPdf = (donation) => {
  const receiptNo = getReceiptNumber(donation);
  const amount = formatPdfCurrency(donation.amount);
  const donatedOn = formatDate(donation.createdAt);
  const transactionId = donation.utr || 'N/A';
  const paymentMode = donation.paymentMode || 'UPI';
  const category = donation.category || 'General Donation';
  const donorName = donation.name || 'Donor';
  const safeTrustAddress = trustAddress || 'Bairampur, Colonelganj, Gonda (U.P.) - 271502';
  const safeTrustPhone = trustPhone || '+91 9792939973';

  const rows = [
    ['Receipt No', receiptNo],
    ['Donor Name', donorName],
    ['Email', donation.email || 'N/A'],
    ['Phone', donation.phone || 'N/A'],
    ['Category', category],
    ['Payment Mode', paymentMode],
    ['Transaction ID', transactionId],
    ['Donation Date', donatedOn]
  ];

  const commands = [
    pdfRect(0, 0, 612, 792, '1 0.98 0.95'),
    pdfRect(48, 52, 516, 688, '1 1 1'),
    pdfRect(48, 680, 516, 60, '1 0.42 0'),
    pdfText(trustName.toUpperCase(), 74, 716, 16, 'F2', '1 1 1'),
    pdfText('Official Donation Receipt', 74, 696, 11, 'F1', '1 1 1'),
    pdfText(`Receipt: ${receiptNo}`, 430, 696, 10, 'F1', '1 1 1'),
    pdfText('DONATION APPROVED', 74, 642, 11, 'F2', '0.60 0.20 0.07'),
    pdfText(`Thank you, ${donorName}`, 74, 618, 20, 'F2', '0.10 0.14 0.22'),
    pdfText('Your generous contribution has been received by the trust.', 74, 596, 11, 'F1', '0.29 0.33 0.41'),
    pdfLine(74, 570, 538, 570, '0.99 0.66 0.38')
  ];

  let y = 535;
  rows.forEach(([label, value]) => {
    commands.push(pdfText(label, 88, y, 10, 'F1', '0.39 0.45 0.55'));
    commands.push(pdfText(value, 330, y, 11, 'F2', '0.10 0.14 0.22'));
    commands.push(pdfLine(88, y - 12, 524, y - 12));
    y -= 34;
  });

  commands.push(
    pdfRect(88, 204, 436, 74, '1 0.97 0.92'),
    'q 1 0.42 0 RG 1 w 88 204 436 74 re S Q',
    pdfText('AMOUNT RECEIVED', 236, 250, 10, 'F2', '0.60 0.20 0.07'),
    pdfText(amount, 238, 224, 24, 'F2', '1 0.34 0'),
    pdfText('May your kindness bring peace, prosperity, and blessings to your family.', 118, 164, 10, 'F1', '0.29 0.33 0.41'),
    pdfLine(74, 132, 538, 132, '0.89 0.91 0.94'),
    pdfText(trustName, 74, 106, 10, 'F2', '0.20 0.25 0.33'),
    pdfText(safeTrustAddress, 74, 90, 9, 'F1', '0.39 0.45 0.55'),
    pdfText(`Phone: ${safeTrustPhone} | Email: ${trustEmail}`, 74, 76, 9, 'F1', '0.39 0.45 0.55'),
    pdfText('This is a computer-generated receipt.', 372, 106, 9, 'F1', '0.39 0.45 0.55')
  );

  const content = commands.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream\nendobj\n`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += object;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'ascii');
};

exports.sendDonationReceiptEmail = async (donation) => {
  if (!donation?.email) {
    return { sent: false, skipped: true, reason: 'Donor email not available' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Receipt email skipped: SMTP environment variables are not configured.');
    return { sent: false, skipped: true, reason: 'SMTP not configured' };
  }

  const html = buildDonationReceiptHtml(donation);
  const receiptNo = getReceiptNumber(donation);
  const receiptPdf = buildDonationReceiptPdf(donation);

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"${trustName}" <${process.env.SMTP_USER}>`,
    to: donation.email,
    bcc: process.env.RECEIPT_BCC_EMAIL || process.env.CONTACT_TO_EMAIL || undefined,
    subject: `Your donation receipt from ${trustName}`,
    text: buildDonationReceiptText(donation),
    html,
    attachments: [
      {
        filename: `${receiptNo}.pdf`,
        content: receiptPdf,
        contentType: 'application/pdf'
      }
    ]
  });

  return {
    sent: true,
    skipped: false,
    attachment: `${receiptNo}.pdf`,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  };
};

const buildContactMessageHtml = (contact) => {
  const submittedOn = formatDate(contact.createdAt);
  const safeName = escapeHtml(contact.name);
  const safeEmail = escapeHtml(contact.email);
  const safeMessage = escapeHtml(contact.message).replace(/\n/g, '<br />');
  const safeTrustName = escapeHtml(trustName);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Contact Message</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;">New contact message from ${safeName}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #fed7aa;box-shadow:0 14px 40px rgba(154,52,18,0.10);">
            <tr>
              <td style="background:#ff6b00;padding:24px 28px;text-align:center;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Website Contact Form</div>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;">New Message Received</h1>
                <p style="margin:10px 0 0;font-size:15px;line-height:1.6;">A visitor sent a message to ${safeTrustName}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 18px;background:#fff7ed;color:#9a3412;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Visitor Details</td>
                  </tr>
                  <tr>
                    <td style="padding:18px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:9px 0;color:#64748b;font-size:13px;">Name</td>
                          <td align="right" style="padding:9px 0;font-weight:700;font-size:14px;">${safeName}</td>
                        </tr>
                        <tr>
                          <td style="padding:9px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Email</td>
                          <td align="right" style="padding:9px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;"><a href="mailto:${safeEmail}" style="color:#ff6b00;text-decoration:none;">${safeEmail}</a></td>
                        </tr>
                        <tr>
                          <td style="padding:9px 0;color:#64748b;font-size:13px;border-top:1px dashed #e2e8f0;">Submitted On</td>
                          <td align="right" style="padding:9px 0;font-weight:700;font-size:14px;border-top:1px dashed #e2e8f0;">${submittedOn}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:20px;background:#fffaf5;border:1px solid #fed7aa;border-radius:14px;padding:20px;">
                  <div style="font-size:12px;color:#9a3412;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Message</div>
                  <div style="font-size:15px;line-height:1.7;color:#334155;">${safeMessage}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:16px 28px;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                Reply directly to this email to contact ${safeName}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

exports.sendContactMessageEmail = async (contact) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Contact email skipped: SMTP environment variables are not configured.');
    return { sent: false, skipped: true, reason: 'SMTP not configured' };
  }

  const to = process.env.CONTACT_TO_EMAIL || trustEmail || process.env.SMTP_USER;
  if (!to) {
    return { sent: false, skipped: true, reason: 'Contact receiver email not configured' };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"${trustName}" <${process.env.SMTP_USER}>`,
    to,
    replyTo: contact.email,
    subject: `New contact message from ${contact.name}`,
    text: [
      `New contact message for ${trustName}`,
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Date: ${formatDate(contact.createdAt)}`,
      '',
      contact.message
    ].join('\n'),
    html: buildContactMessageHtml(contact)
  });

  return { sent: true, skipped: false };
};

const buildNotificationHtml = (notification) => {
  const safeTitle = escapeHtml(notification.title);
  const safeMessage = escapeHtml(notification.message).replace(/\n/g, '<br />');
  const safeType = escapeHtml(notification.type || 'General');
  const safeTrustName = escapeHtml(trustName);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#fff7ed;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;">${safeTitle}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
            <tr>
              <td style="background:#ff6b00;padding:24px 28px;color:#ffffff;text-align:center;">
                <div style="font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${safeType} Notification</div>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <div style="font-size:15px;line-height:1.8;color:#334155;">${safeMessage}</div>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:18px 28px;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                <strong style="color:#334155;">${safeTrustName}</strong><br />
                ${escapeHtml(trustAddress)}${trustAddress ? '<br />' : ''}
                ${trustPhone ? `Phone: ${escapeHtml(trustPhone)}<br />` : ''}
                Email: ${escapeHtml(trustEmail)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

exports.sendNotificationEmail = async (notification, recipients) => {
  const emails = [...new Set((recipients || [])
    .map(email => String(email || '').trim().toLowerCase())
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];

  if (emails.length === 0) {
    return { sent: false, skipped: true, reason: 'No recipient emails found', recipientCount: 0 };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Notification email skipped: SMTP environment variables are not configured.');
    return { sent: false, skipped: true, reason: 'SMTP not configured', recipientCount: emails.length };
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"${trustName}" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_TO_EMAIL || trustEmail,
    bcc: emails,
    subject: `${notification.title} - ${trustName}`,
    text: [
      `${trustName} - ${notification.type || 'General'} Notification`,
      '',
      notification.title,
      '',
      notification.message
    ].join('\n'),
    html: buildNotificationHtml(notification)
  });

  return {
    sent: true,
    skipped: false,
    recipientCount: emails.length,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  };
};

const buildPasswordResetHtml = (resetUrl) => {
  const safeTrustName = escapeHtml(trustName);
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Password Reset Request</title>
  </head>
  <body style="margin:0;background:#fff5eb;font-family:Arial,Helvetica,sans-serif;color:#172033;padding:20px 10px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #fed7aa;box-shadow:0 8px 24px rgba(251,146,60,0.1);">
      <tr>
        <td style="background:#ff6b00;padding:24px;text-align:center;color:#ffffff;">
          <h1 style="margin:0;font-size:24px;line-height:1.2;">Password Reset Link</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Shree Mandir Trust Administrator Panel</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;line-height:1.6;font-size:15px;color:#334155;">
          <p>Hello,</p>
          <p>We received a request to reset the password for your administrator account at <strong>${safeTrustName}</strong>.</p>
          <p>To set a new password, please click the button below within the next hour:</p>
          
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#ff6b00;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:24px;font-weight:700;display:inline-block;box-shadow:0 4px 12px rgba(255,107,0,0.25);">
              Reset Password Now
            </a>
          </div>
          
          <p style="color:#64748b;font-size:13px;word-break:break-all;">
            If you're having trouble with the button, copy and paste this URL into your browser:<br />
            <a href="${resetUrl}" style="color:#ff6b00;text-decoration:none;">${resetUrl}</a>
          </p>
          
          <p>If you did not request this change, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p style="margin-top:28px;border-top:1px solid #f1f5f9;padding-top:20px;color:#64748b;font-size:14px;">
            Warm regards,<br />
            <strong>${safeTrustName} Team</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Password reset email skipped: SMTP environment variables are not configured.');
    return { sent: false, skipped: true, reason: 'SMTP not configured' };
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"${trustName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Password Reset Request - ${trustName}`,
    text: `You requested a password reset for your administrator account at ${trustName}. Please reset your password by opening the following link: ${resetUrl}`,
    html: buildPasswordResetHtml(resetUrl)
  });

  return {
    sent: true,
    skipped: false,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  };
};
