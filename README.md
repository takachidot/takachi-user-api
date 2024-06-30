# takachi-user-api
Kullanıcının diğer sunuculardaki verilerini gösteren ufak bir yazılım.

## Kurulum
* Ilk olarak terminali açıp npm i komutunu kullanın.
* Ardından dosyadaki config/index.json dosyasındaki Token kısmını kendi tokeninizle değiştirin (Tokenin bir hesap tokeni olması şart.)
* Son olarak terminalde npm run start komutunu kullanıp uygulamayı aktifleştirin.

## Kullanım

### Discord Bot

Discord botunuzda apiyi kullanmak istiyorsanız altta bıraktığım örnek kodu kullanmalısınız.

```javascript
const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client({
    intents: Object.values(Discord.GatewayIntentBits),
    partials: Object.values(Discord.Partials)
});
const prefix = '!';

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'info') {
    if (!args.length) {
      return message.channel.send(`Kullanım: ${prefix}info <kullanıcı-id>`);
    }


    const userId = args[0];

    try {

      const response = await axios.get(`http://localhost:1555/api/user?id=${userId}`);

      // API'den gelen veriyi al
      const userData = response.data;
      const userName = userData.base.topName;
      const userAge = userData.base.topAge;
      const userGender = userData.base.gender;

      // Mesaj olarak kullanıcı bilgilerini gönder
      message.channel.send(`${userName} adlı kullanıcının yaşı ${userAge}, cinsiyeti ${userGender}.`);
    } catch (error) {
      console.error('API isteği başarısız oldu:', error);
      message.channel.send('Kullanıcı bilgileri alınamadı.');
    }
  }
});

client.login('tokeniniz'); // Discord bot tokeniniz
```

bu işlemde lütfen uygulamanın açık olduğundan emin olun yoksa belirtilen API'ye istek atamaz.

### Json formatında veriyi alma
Eğer kullanıcının bilgilerini json formatında konsola yazdırmak istiyorsanız, aşağdaki kodu kullanabilirsiniz:

```javascript
const fetch = require('node-fetch');

async function fetchUserInfo(userId) {
  try {
    const response = await fetch(`http://localhost:1555/api/user?id=${userId}`);
    if (!response.ok) {
      throw new Error('API isteği başarısız oldu:', response.statusText);
    }
    const userData = await response.json();
    console.log('Kullanıcı Bilgileri:', userData);
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// Kullanıcı ID'sini burada değiştirin veya kullanıcı girdisinden alabilirsiniz
const userId = 'kullanıcı-id';
fetchUserInfo(userId);
```
Aynı şekilde bu işlemi uygularken lütfen uygulamanın açık olduğundan emin olun yoksa belirtilen API'ye istek atamaz

## Lisans
Bu proje Apache-2.0 lisansı altında lisanslanmıştır. Detaylı lisans bilgileri için [LICENSE](https://github.com/takachidot/takachi-user-api/blob/main/LICENSE) dosyasına göz atabilirsiniz.

## İletişim

[![Discord Presence](https://lanyard.cnrad.dev/api/149284207833645056)](https://discord.com/users/149284207833645056)
