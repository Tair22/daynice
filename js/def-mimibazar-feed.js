/* 

    MIMIBAZAR feed | Načítání 4 nebo 8 článků

    UMÍSTĚNÍ
    Ve stránce musí být připraven:

        <div id="mimibazar-block"><!-- Mimibazar box --></div>

    To vychází z předchozího řešení - vkládá se všude přes inzertní pozici.


    ZDROJ DAT A NASTAVENÍ
    je definováno před načtením skriptu v proměnné 'mimiBazarFeed', ex:

    var mimiBazarFeed = {
      'source': 'https://www.mimibazar.cz/banner-mmb-nabidka.php?typ=1&json=1',
      'options': {
        'titleLink': true
      }
    };

    URL, která lze vkládat v nastavení inzertní pozice do 'source':
        8 článků: https://www.mimibazar.cz/banner-mmb-nabidka.php?typ=1&json=1
        4 články: https://www.mimibazar.cz/banner-mmb-nabidka.php?typ=1&json=1&num=4

*/

;(function () {
  // Získat JSON z URL
  var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'json'
    xhr.onload = function () {
      var status = xhr.status

      if (status == 200) {
        callback(null, xhr.response)
      } else {
        callback(status)
      }
    }
    xhr.send()
  }

  getJSON(mimiBazarFeed.source, function (err, data) {
    if (err != null) {
      console.error('Mimibazar.cz - selhalo načítání dat z feedu.')
      //console.error(err)
    } else {
      // CSS default
      var cssUrl =
        '//img.blesk.cz/css/default/components/def-mimibazar-feed.css'
      // '//blesk.name.wdev/css/default/components/def-mimibazar-feed.css?nocache' // dev-pro testy
      var cssLinkElement = this.document.createElement('link')
      cssLinkElement.setAttribute('rel', 'stylesheet')
      cssLinkElement.setAttribute('type', 'text/css')
      cssLinkElement.setAttribute('href', cssUrl)
      document.getElementsByTagName('head')[0].prepend(cssLinkElement)

      // <div> připravený pro naplnění elementy
      var mimibazarBlock = document.getElementById('mimibazar-block')
      mimibazarBlock.classList.add('mimibazar-block')
      mimibazarBlock.classList.add('customizable')

      // Titulek
      var blockTitle = document.createElement('H2')
      var blockTitleContent = document.createTextNode('Mimibazar.cz')
      // pokud je v nastavení -> vytvořit odkaz v titulku
      if (
        typeof mimiBazarFeed.options !== 'undefined' &&
        mimiBazarFeed.options.titleLink === true
      ) {
        var blockTitleHref = document.createElement('a')
        blockTitleHref.target = '_blank'
        blockTitleHref.href = 'https://mimibazar.cz'
        blockTitleHref.appendChild(blockTitleContent)
        blockTitle.appendChild(blockTitleHref)
      } else {
        blockTitle.appendChild(blockTitleContent)
      }
      mimibazarBlock.appendChild(blockTitle)

      // Ošetření dat v případě užšího výběru
      var restructuredData = []
      if (mimiBazarFeed.source.includes('num=4')) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            restructuredData.push(data[key])
          }
        }
        data = restructuredData
      }

      console.log(mimiBazarFeed.options)

      // <div class="items"></div>
      var itemList = document.createElement('div')
      itemList.classList.add('items')
      mimibazarBlock.appendChild(itemList)

      // Vytvořit a vložit elementy
      var i
      for (i = 0; i < data.length; i++) {
        // Obálka položky
        var item = document.createElement('div')
        item.classList.add('item')

        // GTM 2.0 | Google Analytics: Apps + Web
        var position = i + 1
        var nameForStats = 'mimibazarFeed-' + position
        var trackListContent = {
          item: {
            elementId: nameForStats,
            type: 'shortArticle',
            list: 'mimiBazarFeed',
            position: position,
            systemId: 'mimibazar',
            url: data[i].url,
          },
        }
        item.setAttribute('data-track-element-id', nameForStats)
        item.setAttribute('data-track-list', JSON.stringify(trackListContent))

        // Obrázek
        var image = document.createElement('img')
        image.src = data[i].img
        image.alt = data[i].nazev

        // Odkaz obrázku
        var linkImage = document.createElement('a')
        linkImage.href = data[i].url
        linkImage.classList.add('image')
        linkImage.appendChild(image)

        // Textový odkaz
        var linkTitle = document.createElement('a')
        linkTitle.href = data[i].url
        linkTitle.text = data[i].nazev
        linkTitle.classList.add('title')
        linkTitle.target = '_blank'

        // Textový odkaz 'Více info'
        var linkMore = document.createElement('a')
        linkMore.href = data[i].url
        linkMore.classList.add('more')
        linkMore.text = 'Více info'
        linkMore.target = '_blank'

        // Poskládání elementů
        item.appendChild(linkImage)
        item.appendChild(linkTitle)
        item.appendChild(linkMore)

        itemList.appendChild(item)
      }
    }
  })
})()
