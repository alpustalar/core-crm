import { APP_CONFIG } from '@common/constants';

export const organizationDeletionRequestTemplate = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organizasyon Silme Talebi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <tr>
            <td align="center" style="background-color: #00b4d8; padding: 30px 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">${APP_CONFIG.NAME}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 22px; text-align: center;">Organizasyon Silme Talebiniz Alındı</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">
                Organizasyonunuzun silinmesi talebinizi yetkililere ilettik. Talebiniz incelendikten sonra size bilgi verilecektir.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2026 ${APP_CONFIG.NAME}. Tüm hakları saklıdır. <br>
                Bu maili organizasyon silme işlemi talebi üzerine aldınız. Talebi siz yapmadıysanız lütfen bu maili siliniz.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
