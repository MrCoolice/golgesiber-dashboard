fetch('https://bigpara.hurriyet.com.tr/borsa/hisse-senetleri/altin-s1-detay/')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/<span class="value up">([0-9,]+)<\/span>/i) || t.match(/<span class="value down">([0-9,]+)<\/span>/i) || t.match(/<span class="value">([0-9,]+)<\/span>/i);
    console.log('Bigpara:', match ? match[1] : 'Not found');
  })
  .catch(console.error);
