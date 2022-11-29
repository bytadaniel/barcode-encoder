```ts
createPdfStickers({
	page: {
		sizeMM: {
			width: 210,
			height: 297
		},
		offsetMM: {
			width: 15,
			height: 10
		}
	},
	sticker: {
		stroke: true,
		eac: true,
		separateBarcodeAndInfo: false,
		spaceBetweenMM: 1
	},
  stickers: [
    {
      sizeMM: {
        width: 52,
        height: 34
        // width: 20,
        // height: 10 // bug todo fix
      },
      barcode: {
        input: '2008099808000',
        type: 'CODE128'
      },
			text: [
				'браслет малахит',
				'Артикул: 45253152 Цв.: ярко-зеленый / Раз.: 18-21',
				'Страна: Россия',
				'Бренд: scarlet flower',
				'',
				'Товар подлежит обязательной сертификации'
			].join('\n'),
      count: 25
    },
		{
      sizeMM: {
        width: 40,
        height: 25
        // width: 20,
        // height: 10 // bug todo fix
      },
      barcode: {
        input: '2008099808000',
        type: 'EAN13'
      },
			text: [
				'браслет малахит',
				'Артикул: 45253152 Цв.: ярко-зеленый / Раз.: 18-21',
				'Страна: Россия',
				'Бренд: scarlet flower',
				'',
				'Товар подлежит обязательной сертификации'
			].join('\n'),
      count: 25
    }
  ]
})
```