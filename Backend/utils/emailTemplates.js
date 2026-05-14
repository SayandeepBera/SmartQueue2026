// ── Shared HTML wrapper ───────────────────────────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#0d1f2d 100%);
                     padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#14b8a6;font-size:22px;letter-spacing:1px;">SmartQueue</h1>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Organization Management Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;
                     border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              SmartQueue · allinoneadmin4002@gmail.com<br/>
              You received this email because your organization applied for registration.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Template 1. OTP / Password Reset ───────────────────────────────────────────────────
export const getOTPTemplate = (username, otp) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Reset Your Password 🔐</h2>
  <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">
    Hello <strong>${username}</strong>, we received a request to access your account. 
    Please use the verification code below to complete your password reset. 
    This code is valid for <strong>10 minutes</strong>.
  </p>

  <div style="text-align:center;margin-bottom:30px;">
    <div style="display:inline-block;background:#f8fafc;padding:24px 48px;border-radius:12px;border:2px dashed #e2e8f0;">
      <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#14b8a6;font-family:monospace;">
        ${otp}
      </span>
    </div>
  </div>

  <div style="background:#fff7ed;border:1px solid #ffedd5;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.6;">
      <strong>Security Note:</strong> If you didn’t request this, you can safely ignore this email. 
      Someone may have entered your email address by mistake. Your password will not change unless you use this code.
    </p>
  </div>

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Never share this code with anyone, including SmartQueue staff.
  </p>
`);


// Organation email templates
// Template 2. Registration received  (includes auto-generated login credentials) ─────
export const getOrgRegistrationEmailTemplate = (
  adminName, orgName, email, username, plainPassword
) => wrap(`
  <h2 style="margin:0 0 4px;color:#0f172a;font-size:20px;">Application Received ✅</h2>
  <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, we've received the registration request for
    <strong>${orgName}</strong>. Our team will review your documents within
    <strong>1–2 business days</strong>.
  </p>

  <!-- Credentials box -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:12px;
              padding:24px;margin-bottom:24px;">
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0f766e;
              text-transform:uppercase;letter-spacing:1px;">
      🔐 Your Login Credentials
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ccfbf1;">
          <span style="font-size:12px;color:#64748b;display:block;margin-bottom:3px;">Email</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;
                       font-family:monospace;">${email}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ccfbf1;">
          <span style="font-size:12px;color:#64748b;display:block;margin-bottom:3px;">Username</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;
                       font-family:monospace;">${username}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:12px;color:#64748b;display:block;margin-bottom:3px;">Temporary Password</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;
                       font-family:monospace;">${plainPassword}</span>
        </td>
      </tr>
    </table>

    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;
                padding:12px 14px;margin-top:16px;">
      <p style="margin:0;font-size:12px;color:#713f12;line-height:1.6;">
        ⚠️ <strong>Important:</strong> These are your temporary credentials.
        Once your application is approved, please log in and
        <strong>change both your username and password</strong> immediately from your profile settings.
        Do not share these credentials with anyone.
      </p>
    </div>
  </div>

  <!-- What happens next -->
  <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#475569;
              text-transform:uppercase;letter-spacing:1px;">What happens next</p>
    <ul style="margin:0;padding-left:18px;color:#64748b;font-size:13px;line-height:2.2;">
      <li>Our team reviews your submitted documents</li>
      <li>You will receive an approval or rejection email</li>
      <li>After approval, log in using the credentials above</li>
      <li>Change your password from <strong>Profile → Security Settings</strong></li>
    </ul>
  </div>
`);


// Template 3. Approved ───────────────────────────────────────────────────────────────
export const getOrgApprovalTemplate = (
  adminName, orgName, loginUrl = `${process.env.FRONTEND_URL}/login`
) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Organization Approved 🎉</h2>
  <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, great news!
    <strong>${orgName}</strong> has been
    <span style="color:#16a34a;font-weight:700;">approved</span> on SmartQueue.
    You can now log in with the credentials sent in your registration email.
  </p>

  <div style="text-align:center;margin-bottom:24px;">
    <a href="${loginUrl}"
       style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#0d9488);
              color:#000;text-decoration:none;padding:14px 36px;border-radius:10px;
              font-weight:700;font-size:14px;">
      Log in to Dashboard →
    </a>
  </div>

  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:10px;
              padding:16px 20px;">
    <p style="margin:0;font-size:13px;color:#0f766e;line-height:1.7;">
      💡 Reminder: After logging in, go to <strong>Profile → Security Settings</strong>
      to change your temporary username and password.
    </p>
  </div>
`);


// Template 4. Rejected ───────────────────────────────────────────────────────────────
export const getOrgRejectionTemplate = (adminName, orgName, reason = '') => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Application Update</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, unfortunately the registration for
    <strong>${orgName}</strong> could not be approved at this time.
  </p>

  ${reason ? `
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;
              padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#dc2626;
              text-transform:uppercase;letter-spacing:1px;">Reason</p>
    <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.6;">${reason}</p>
  </div>` : ''}

  <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
    Please correct the issue(s) and re-submit your application, or contact
    <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>
    for assistance.
  </p>
`);


// Template 5. Scheduled for deletion ─────────────────────────────────────────────────
export const getOrgDeletionTemplate = (adminName, orgName, deletionDate) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Account Scheduled for Deletion ⚠️</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, the account for <strong>${orgName}</strong>
    has been scheduled for permanent deletion on
    <strong style="color:#dc2626;">${new Date(deletionDate).toDateString()}</strong>.
  </p>
  <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
    If this was a mistake, please contact
    <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>
    before that date to reactivate your account.
  </p>
`);

// Template 6. Permanently Deactivated / Deleted ──────────────────────────────────────
export const getOrgDeactivationTemplate = (orgName) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Organization Profile Deactivated</h2>
  <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">
    This is to inform you that the organization profile for
    <strong>${orgName}</strong> has been <span style="color:#dc2626;font-weight:700;">permanently deactivated</span>
    as the account deletion grace period has expired.
  </p>
 
  <!-- What was removed -->
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;
              padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#dc2626;
              text-transform:uppercase;letter-spacing:1px;">What has been removed</p>
    <ul style="margin:0;padding-left:18px;color:#7f1d1d;font-size:13px;line-height:2.2;">
      <li>Registration Certificate</li>
      <li>GST Certificate</li>
      <li>Address Proof document</li>
      <li>Organization logo</li>
      <li>Active queue access and dashboard</li>
    </ul>
  </div>
 
  <!-- Data retention notice -->
  <div style="background:#f8fafc;border-left:4px solid #94a3b8;
              padding:14px 18px;margin-bottom:24px;border-radius:0 8px 8px 0;">
    <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">
      <strong>Data Retention Policy:</strong> As per SmartQueue's data retention policy,
      all uploaded documents and associated Cloudinary assets have been permanently deleted
      and cannot be recovered.
    </p>
  </div>
 
  <!-- Re-register CTA -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:12px;
              padding:20px 24px;margin-bottom:8px;">
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f766e;">
      Want to continue using SmartQueue?
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#475569;line-height:1.6;">
      You can re-register your organization at any time. You will need to submit
      your documents again for verification.
    </p>
    <a href="${process.env.FRONTEND_URL}/register"
       style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#0d9488);
              color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;
              font-weight:700;font-size:13px;">
      Re-register Organization →
    </a>
  </div>
 
  <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
    If you believe this was a mistake or need further assistance, please reach out to us at
    <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>.
  </p>
`);

// Template 7. Reactivated ────────────────────────────────────────────────────────────
export const getOrgReactivationTemplate = (adminName, orgName) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Account Reactivated ✅</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, your organization <strong>${orgName}</strong>
    has been successfully reactivated. You can now log in and continue using SmartQueue.
  </p>
`);

// Template 8. Suspended 
export const getOrgSuspensionTemplate = (adminName, orgName, reason = '') => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Organization Suspended 🛑</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${adminName}</strong>, your organization <strong>${orgName}</strong>
    has been <span style="color:#ea580c;font-weight:700;">suspended</span> on SmartQueue.
    Access to your dashboard has been temporarily restricted.
  </p>
 
  ${reason ? `
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;
              padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#ea580c;
              text-transform:uppercase;letter-spacing:1px;">Reason</p>
    <p style="margin:0;color:#7c2d12;font-size:13px;line-height:1.6;">${reason}</p>
  </div>` : ''}
 
  <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#475569;
              text-transform:uppercase;letter-spacing:1px;">What this means</p>
    <ul style="margin:0;padding-left:18px;color:#64748b;font-size:13px;line-height:2.2;">
      <li>Your organization's queue services are paused</li>
      <li>Users cannot book new tokens during suspension</li>
      <li>Your data is safe and will not be deleted</li>
      <li>The suspension can be lifted by our admin team</li>
    </ul>
  </div>
 
  <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
    If you believe this was a mistake or want to appeal, please contact
    <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>.
  </p>
`);

// Template 9. User Suspended
export const getUserSuspensionTemplate = (displayName, email) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Account Suspended ⚠️</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${displayName}</strong>, your SmartQueue account
    (<span style="color:#0f172a;font-weight:600;">${email}</span>)
    has been <span style="color:#dc2626;font-weight:700;">suspended</span> by an administrator.
  </p>
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;
              padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
      While suspended you will not be able to log in or use SmartQueue services.
      If you believe this is a mistake, please contact support.
    </p>
  </div>
  <p style="color:#64748b;font-size:13px;margin:0;">
    Contact us at
    <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>
  </p>
`);


// Template 10. User restored
export const getUserRestorationTemplate = (displayName, email) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Account Restored ✅</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${displayName}</strong>, your SmartQueue account
    (<span style="color:#0f172a;font-weight:600;">${email}</span>)
    has been <span style="color:#16a34a;font-weight:700;">restored</span>.
    You can now log in and use SmartQueue again.
  </p>
  <div style="text-align:center;margin-bottom:20px;">
    <a href="${process.env.FRONTEND_URL}/login"
       style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#0d9488);
              color:#000;text-decoration:none;padding:12px 28px;border-radius:10px;
              font-weight:700;font-size:14px;">
      Log in →
    </a>
  </div>
`);


// Template 11. User permanently deleted
export const getUserDeletionTemplate = (displayName, email) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Account Removed</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${displayName}</strong>, your SmartQueue account
    (<span style="color:#0f172a;font-weight:600;">${email}</span>)
    has been <span style="color:#dc2626;font-weight:700;">permanently removed</span>
    from the platform by an administrator.
  </p>
  <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;">
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
      All your data including token history and profile information has been deleted.
      If you believe this is a mistake, contact
      <a href="mailto:allinoneadmin4002@gmail.com" style="color:#14b8a6;">allinoneadmin4002@gmail.com</a>.
    </p>
  </div>
`);

// Template 12 . Token Booked
export const getTokenBookingConfirmationTemplate = (
  name, tokenNumber, serviceName, orgName, counter, estimatedWait, position, address, directions
) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Token Booked Successfully 🎟️</h2>
  <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, your queue token at
    <strong>${orgName}</strong> has been confirmed.
    Please arrive before your turn — you will be called at the counter.
  </p>

  <!-- Token badge -->
  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;background:#f0fdf9;border:2px dashed #5eead4;
                border-radius:16px;padding:28px 52px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#0f766e;
                text-transform:uppercase;letter-spacing:2px;">Your Token</p>
      <span style="font-size:40px;font-weight:900;letter-spacing:4px;
                   color:#14b8a6;font-family:monospace;display:block;">
        ${tokenNumber}
      </span>
      <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${serviceName}</p>
    </div>
  </div>

  <!-- Details grid -->
  <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#475569;
              text-transform:uppercase;letter-spacing:1px;">Booking Details</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;width:50%;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Organization</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;">${orgName}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Service</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;">${serviceName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;width:50%;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Counter</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;">${counter}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Booked On</span>
          <span style="font-size:14px;font-weight:600;color:#0f172a;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;width:50%;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Queue Position</span>
          <span style="font-size:22px;font-weight:800;color:#14b8a6;font-family:monospace;">#${position}</span>
        </td>
        <td style="padding:8px 0;">
          <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;">Est. Wait Time</span>
          <span style="font-size:22px;font-weight:800;color:#14b8a6;font-family:monospace;">~${estimatedWait} <span style="font-size:14px;font-weight:400;color:#64748b;">min</span></span>
        </td>
      </tr>
    </table>
  </div>

  ${address ? `
  <!-- Location -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;
              padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1e40af;
              text-transform:uppercase;letter-spacing:1px;">📍 Where to Go</p>
    <p style="margin:0;font-size:13px;color:#1e3a8a;line-height:1.7;">
      <strong>${orgName}</strong><br/>${address}
      ${directions ? `<br/><span style="color:#3b82f6;">${directions}</span>` : ''}
    </p>
  </div>` : ''}

  <!-- Tips -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:10px;
              padding:16px 20px;margin-bottom:20px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0f766e;
              text-transform:uppercase;letter-spacing:1px;">💡 Tips</p>
    <ul style="margin:0;padding-left:18px;color:#0f766e;font-size:13px;line-height:2.2;">
      <li>Track your queue position live on the SmartQueue app</li>
      <li>Arrive a few minutes before your estimated turn</li>
      <li>Keep this token number handy — you may be asked for it</li>
    </ul>
  </div>

  <div style="background:#fff7ed;border:1px solid #ffedd5;border-radius:10px;
              padding:14px 18px;">
    <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.6;">
      <strong>Note:</strong> If you cannot attend, please inform the counter staff so the
      next person in line can be served promptly.
    </p>
  </div>
`);

// Template 13: Contact Form - User Confirmation
export const getContactFormUserTemplate = (name, category, message) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">We got your message! 📬</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, thank you for reaching out to SmartQueue Support.
    Your inquiry has been received and our team will get back to you within <strong>4 hours</strong>.
  </p>
  <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
    <div style="font-size:13px;font-weight:600;color:#00c9a7;margin-bottom:6px;">${category}</div>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">${message}</p>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Support hours: Mon–Sat, 9 AM – 6 PM · allinoneadmin4002@gmail.com
  </p>
`);

// Template 14: Contact Form - Admin Notification
export const getContactFormAdminTemplate = (name, email, category, message) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">📩 New Support Inquiry</h2>
  <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;">From</span>
        <span style="font-size:14px;font-weight:600;color:#0f172a;">${name} &lt;${email}&gt;</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;">Category</span>
        <span style="font-size:14px;font-weight:600;color:#14b8a6;">${category}</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:3px;">Message</span>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">${message}</p>
      </td></tr>
    </table>
  </div>
`);

// Template 15: Bug Report - User Confirmation
export const getReportUserTemplate = (name, title, category, priority) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Bug Report Received 🐛</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, thank you for helping us improve SmartQueue.
    Our engineering team will review your report and get back to you soon.
  </p>
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1px;">Report Details</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;border-bottom:1px solid #ffedd5;">
        <span style="font-size:11px;color:#9a3412;">Title</span>
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${title}</div>
      </td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #ffedd5;">
        <span style="font-size:11px;color:#9a3412;">Category</span>
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${category}</div>
      </td></tr>
      <tr><td style="padding:6px 0;">
        <span style="font-size:11px;color:#9a3412;">Priority</span>
        <div style="font-size:14px;font-weight:600;color:#0f172a;text-transform:capitalize;">${priority}</div>
      </td></tr>
    </table>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">SmartQueue · allinoneadmin4002@gmail.com</p>
`);

// Template 16: Bug Report - Admin Notification
export const getReportAdminTemplate = (name, email, title, category, priority, description) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">🐛 New Bug Report</h2>
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;border-bottom:1px solid #fecdd3;">
        <span style="font-size:11px;color:#9f1239;">From</span>
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${name} &lt;${email}&gt;</div>
      </td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #fecdd3;">
        <span style="font-size:11px;color:#9f1239;">Title</span>
        <div style="font-size:14px;font-weight:700;color:#0f172a;">${title}</div>
      </td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #fecdd3;">
        <span style="font-size:11px;color:#9f1239;">Category / Priority</span>
        <div style="font-size:14px;color:#0f172a;">${category} · <strong style="color:#dc2626;text-transform:capitalize;">${priority}</strong></div>
      </td></tr>
      <tr><td style="padding:6px 0;">
        <span style="font-size:11px;color:#9f1239;">Description</span>
        <p style="margin:4px 0 0;font-size:13px;color:#475569;line-height:1.7;">${description}</p>
      </td></tr>
    </table>
  </div>
`);

// Template 17: Feature Idea - User Confirmation
export const getIdeaUserTemplate = (name, title, category) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Idea Received! 💡</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, thanks for sharing your idea! We love hearing from our users.
    Our product team reviews all submissions and the best ideas make it into our roadmap.
  </p>
  <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:18px 22px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#713f12;text-transform:uppercase;letter-spacing:1px;">Your Idea</p>
    <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">${title}</div>
    <div style="font-size:12px;color:#92400e;">${category}</div>
  </div>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">SmartQueue · allinoneadmin4002@gmail.com</p>
`);

// Template 18: Feature Idea - Admin Notification
export const getIdeaAdminTemplate = (name, email, title, category, description) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">💡 New Feature Idea</h2>
  <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;border-bottom:1px solid #fef08a;">
        <span style="font-size:11px;color:#713f12;">From</span>
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${name} &lt;${email}&gt;</div>
      </td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #fef08a;">
        <span style="font-size:11px;color:#713f12;">Idea Title</span>
        <div style="font-size:15px;font-weight:700;color:#0f172a;">${title}</div>
      </td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #fef08a;">
        <span style="font-size:11px;color:#713f12;">Category</span>
        <div style="font-size:14px;color:#0f172a;">${category}</div>
      </td></tr>
      <tr><td style="padding:6px 0;">
        <span style="font-size:11px;color:#713f12;">Description</span>
        <p style="margin:4px 0 0;font-size:13px;color:#475569;line-height:1.7;">${description}</p>
      </td></tr>
    </table>
  </div>
`);

// Template 19: Admin Response to Inquiry
export const getInquiryResponseTemplate = (name, category, originalMessage, adminResponse, status) => wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Response to Your Inquiry 💬</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, our support team has responded to your inquiry.
  </p>

  <!-- Status badge -->
  <div style="text-align:center;margin-bottom:24px;">
    <span style="display:inline-block;padding:6px 18px;border-radius:20px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;
      background:${status === 'resolved' ? '#f0fdf9' : '#fff7ed'};
      color:${status === 'resolved' ? '#16a34a' : '#c2410c'};
      border:1px solid ${status === 'resolved' ? '#5eead4' : '#fed7aa'};">
      ${status === 'resolved' ? '✅ Resolved' : status === 'in-progress' ? '🔄 In Progress' : '📋 ' + status}
    </span>
  </div>

  <!-- Original message -->
  <div style="background:#f8fafc;border-left:3px solid #cbd5e1;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:20px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Original Message · ${category}</p>
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;font-style:italic;">"${originalMessage}"</p>
  </div>

  <!-- Admin response -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:1px;">🛟 Support Team Response</p>
    <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.8;">${adminResponse}</p>
  </div>

  <div style="background:#f8fafc;border-radius:10px;padding:14px 18px;">
    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
      Still need help? Reply to this email or start a live chat at
      <a href="${process.env.FRONTEND_URL}/support" style="color:#14b8a6;">SmartQueue Support</a>.
    </p>
  </div>
`);

// Template 20: Admin Response to Bug Report
export const getBugResponseTemplate = (name, title, category, adminResponse, status) => {
  const STATUS_STYLES = {
    open: { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c", label: "Open" },
    in_review: { bg: "#fefce8", border: "#fde047", color: "#854d0e", label: "In Review" },
    planned: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", label: "Planned" },
    resolved: { bg: "#f0fdf9", border: "#5eead4", color: "#0f766e", label: "Resolved ✅" },
    closed: { bg: "#f8fafc", border: "#cbd5e1", color: "#475569", label: "Closed" },
  };
  const s = STATUS_STYLES[status] || STATUS_STYLES.in_review;
  return wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Update on Your Bug Report 🐛</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, our engineering team has reviewed your bug report and provided an update.
  </p>

  <!-- Report card -->
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px 22px;margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1px;">Bug Report</p>
    <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#0f172a;">${title}</p>
    <div style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;
      background:${s.bg};color:${s.color};border:1px solid ${s.border};">
      ${s.label}
    </div>
  </div>

  <!-- Admin response -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:1px;">👨‍💻 Engineering Team Response</p>
    <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.8;">${adminResponse}</p>
  </div>

  <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">
    Thank you for helping us improve SmartQueue. You can track this issue at
    <a href="${process.env.FRONTEND_URL}/support" style="color:#14b8a6;">SmartQueue Support</a>.
  </p>
`);
};

// Template 21: Admin Response to Feature Idea
export const getIdeaResponseTemplate = (name, title, category, adminResponse, status) => {
  const STATUS_LABELS = {
    open: "Under Consideration",
    in_review: "Reviewing 🔍",
    planned: "On the Roadmap 🗺️",
    resolved: "Implemented ✅",
    closed: "Closed",
  };
  return wrap(`
  <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Update on Your Feature Idea 💡</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px;line-height:1.6;">
    Hi <strong>${name}</strong>, our product team has reviewed your idea and has an update for you!
  </p>

  <!-- Idea card -->
  <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:18px 22px;margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#854d0e;text-transform:uppercase;letter-spacing:1px;">Feature Idea · ${category}</p>
    <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#0f172a;">${title}</p>
    <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;
      background:${status === 'planned' ? '#eff6ff' : status === 'resolved' ? '#f0fdf9' : '#fefce8'};
      color:${status === 'planned' ? '#1d4ed8' : status === 'resolved' ? '#0f766e' : '#854d0e'};
      border:1px solid ${status === 'planned' ? '#bfdbfe' : status === 'resolved' ? '#5eead4' : '#fde047'};">
      ${STATUS_LABELS[status] || status}
    </span>
  </div>

  <!-- Admin response -->
  <div style="background:#f0fdf9;border:1px solid #5eead4;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:1px;">🚀 Product Team Response</p>
    <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.8;">${adminResponse}</p>
  </div>

  <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">
    Keep the ideas coming! Visit <a href="${process.env.FRONTEND_URL}/support" style="color:#14b8a6;">SmartQueue Support</a> to track your submissions.
  </p>
`);
};