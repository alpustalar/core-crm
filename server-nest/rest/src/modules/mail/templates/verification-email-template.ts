import { APP_CONFIG } from '../../../common/constants';

export const verificationEmailTemplate = (link: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-posta Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <tr>
            <td align="center" style="background-color: #00b4d8; padding: 30px 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">DENTISTRY CRM</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 22px; text-align: center;">Hoş Geldiniz</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">
                Kliniğinizi dijitalleştirmek için harika bir adım attınız. Hesabınızı kullanmaya başlamadan önce e-posta adresinizi doğrulamanız gerekiyor.
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #0077b6;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Hesabımı Doğrula
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; text-align: center; line-height: 1.5;">
                Eğer yukarıdaki buton çalışmıyorsa, bu bağlantıyı tarayıcınıza kopyalayabilirsiniz:
              </p>
              <p style="margin: 10px 0 0; color: #00b4d8; font-size: 12px; text-align: center; word-break: break-all;">
                <a href="${link}" style="color: #00b4d8;">${link}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2026 ${APP_CONFIG.NAME}. Tüm hakları saklıdır. <br>
                Bu maili bir üyelik talebi üzerine aldınız. Talebi siz yapmadıysanız lütfen bu maili siliniz.
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
