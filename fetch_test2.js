fetch('https://finans.mynet.com/borsa/hisseler/altins1-darphane-altin-sertifikasi/')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/data-price="([0-9.]+)"/);
    console.log('Mynet Price:', match ? match[1] : 'Not found');
  })
  .catch(console.error);
