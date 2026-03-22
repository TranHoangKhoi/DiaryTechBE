// data/farmHouseGeoJson.ts

export const farmHouseGeoJson: any = {
  type: 'FeatureCollection',
  features: [
    // ===== FARM 1 =====
    {
      type: 'Feature',
      id: 'farm-1',
      geometry: {
        type: 'Point',
        coordinates: [105.6797562607472, 9.959672046211722]
      },
      properties: {
        owner: 'Nguyễn Văn An',
        cropId: 'dau',
        area: 1.2
      }
    },
    {
      type: 'Feature',
      id: 'farm-1-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.67884790527052, 9.959574379651244],
            [105.68056451904033, 9.96020840820266],
            [105.68076836692484, 9.95983855836353],
            [105.67891227828704, 9.95902488724279],
            [105.67884790527052, 9.959574379651244]
          ]
        ]
      },
      properties: {
        owner: 'Nguyễn Văn An',
        cropId: 'dau'
      }
    },

    // ===== FARM 2 =====
    {
      type: 'Feature',
      id: 'farm-2',
      geometry: {
        type: 'Point',
        coordinates: [105.66108598266143, 9.991517156342699]
      },
      properties: {
        owner: 'Trần Thị Bích',
        cropId: 'sau-rieng'
      }
    },
    {
      type: 'Feature',
      id: 'farm-2-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.66060408798387, 9.991927969743173],
            [105.66169437469961, 9.9917262708843],
            [105.66157992470704, 9.991174564552878],
            [105.66046554325521, 9.991239820190444],
            [105.66060408798387, 9.991927969743173]
          ]
        ]
      },
      properties: {
        owner: 'Trần Thị Bích',
        cropId: 'sau-rieng'
      }
    },

    // ===== FARM 3 =====
    {
      type: 'Feature',
      id: 'farm-3',
      geometry: {
        type: 'Point',
        coordinates: [105.73580920054889, 9.991068536899167]
      },
      properties: {
        owner: 'Lê Hoàng Minh',
        cropId: 'mang-cut'
      }
    },
    {
      type: 'Feature',
      id: 'farm-3-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.7353039709048, 9.991593825065664],
            [105.73551053062056, 9.991632311228955],
            [105.73558312612033, 9.991616543675946],
            [105.73576917708357, 9.991622861866517],
            [105.73586718170918, 9.991207011414303],
            [105.73611418066906, 9.991271773548206],
            [105.7361170218789, 9.991195864208635],
            [105.73627825680478, 9.990485673637465],
            [105.73606259034989, 9.990401912164131],
            [105.73601919136843, 9.990515887915976],
            [105.73579978541119, 9.990496891959722],
            [105.73567923268956, 9.99095042010174],
            [105.73541536152516, 9.990900002901924],
            [105.7353039709048, 9.991593825065664]
          ]
        ]
      },
      properties: {
        owner: 'Lê Hoàng Minh',
        cropId: 'mang-cut'
      }
    },

    // ===== FARM 4 =====
    {
      type: 'Feature',
      id: 'farm-4',
      geometry: {
        type: 'Point',
        coordinates: [105.70061275375414, 9.972269544349526]
      },
      properties: {
        owner: 'Phạm Thị Thu',
        cropId: 'chom-chom'
      }
    },
    {
      type: 'Feature',
      id: 'farm-4-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70002582193001, 9.973225881191397],
            [105.70053431586012, 9.97328981437326],
            [105.70116181900949, 9.971339846688778],
            [105.70072905821695, 9.97122263514467],
            [105.70002582193001, 9.973225881191397]
          ]
        ]
      },
      properties: {
        owner: 'Phạm Thị Thu',
        cropId: 'chom-chom'
      }
    },

    // ===== FARM 5 =====
    {
      type: 'Feature',
      id: 'farm-5',
      geometry: {
        type: 'Point',
        coordinates: [105.67765696838471, 9.988473123363505]
      },
      properties: {
        owner: 'Võ Văn Hùng',
        cropId: 'xoai',
        area: 1.6
      }
    },
    {
      type: 'Feature',
      id: 'farm-5-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.67782618558971, 9.98894398723968],
            [105.67814513466851, 9.988743843444013],
            [105.6775988116147, 9.98793677973363],
            [105.67705774166592, 9.988267883036698],
            [105.67782618558971, 9.98894398723968]
          ]
        ]
      },
      properties: {
        owner: 'Võ Văn Hùng',
        cropId: 'xoai'
      }
    },

    // ===== FARM 6 =====
    {
      type: 'Feature',
      id: 'farm-6',
      geometry: {
        type: 'Point',
        coordinates: [105.61360051357912, 10.003669087920409]
      },
      properties: {
        owner: 'Nguyễn Thị Kim Ngân',
        cropId: 'dau',
        area: 1.1
      }
    },
    {
      type: 'Feature',
      id: 'farm-6-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.61227162793557, 10.004522937042452],
            [105.61569031287058, 10.003956475820573],
            [105.61578798958249, 10.003357949681842],
            [105.61571201880713, 10.00247084641218],
            [105.61190262702308, 10.003486205376035],
            [105.6119568918632, 10.003689276787185],
            [105.61331351286861, 10.003368637658497],
            [105.61346545442069, 10.003956475820573],
            [105.61230418684045, 10.004212986684351],
            [105.61227162793557, 10.004522937042452]
          ]
        ]
      },
      properties: {
        owner: 'Nguyễn Thị Kim Ngân',
        cropId: 'dau'
      }
    },

    // ===== FARM 7 =====
    {
      type: 'Feature',
      id: 'farm-7',
      geometry: {
        type: 'Point',
        coordinates: [105.59266368080283, 9.979879208047873]
      },
      properties: {
        owner: 'Trần Quốc Khánh',
        cropId: 'sau-rieng',
        area: 2.8
      }
    },
    {
      type: 'Feature',
      id: 'farm-7-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.59092219049069, 9.97878550162153],
            [105.59277709527038, 9.976816995769141],
            [105.59448296107405, 9.98127714996825],
            [105.5924724763762, 9.98263718483257],
            [105.59092219049069, 9.97878550162153]
          ]
        ]
      },
      properties: {
        owner: 'Trần Quốc Khánh',
        cropId: 'sau-rieng'
      }
    },

    // ===== FARM 8 =====
    {
      type: 'Feature',
      id: 'farm-8',
      geometry: {
        type: 'Point',
        coordinates: [105.61196762069193, 9.957921131321523]
      },
      properties: {
        owner: 'Lê Thị Mỹ Linh',
        cropId: 'mang-cut',
        area: 1.9
      }
    },
    {
      type: 'Feature',
      id: 'farm-8-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.60983822493768, 9.957037868000995],
            [105.6130537554389, 9.95985305333626],
            [105.61423992891355, 9.958909968954671],
            [105.61073857347759, 9.955883634994166],
            [105.60983822493768, 9.957037868000995]
          ]
        ]
      },
      properties: {
        owner: 'Lê Thị Mỹ Linh',
        cropId: 'mang-cut'
      }
    },

    // ===== FARM 9 =====
    {
      type: 'Feature',
      id: 'farm-9',
      geometry: {
        type: 'Point',
        coordinates: [105.62955113200523, 10.005244916321079]
      },
      properties: {
        owner: 'Đặng Văn Phúc',
        cropId: 'chom-chom',
        area: 2.1
      }
    },
    {
      type: 'Feature',
      id: 'farm-9-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.62879679071546, 10.005644011065911],
            [105.63046195898852, 10.005742796721478],
            [105.63064251940415, 10.004952510634652],
            [105.62903753793506, 10.00439930922903],
            [105.628816852983, 10.00548595395432],
            [105.62879679071546, 10.005644011065911]
          ]
        ]
      },
      properties: {
        owner: 'Đặng Văn Phúc',
        cropId: 'chom-chom'
      }
    },

    // ===== FARM 10 =====
    {
      type: 'Feature',
      id: 'farm-10',
      geometry: {
        type: 'Point',
        coordinates: [105.65549369434487, 9.978593479997603]
      },
      properties: {
        owner: 'Huỳnh Thị Diễm',
        cropId: 'xoai',
        area: 3.0
      }
    },
    {
      type: 'Feature',
      id: 'farm-10-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65424994523482, 9.979927207958795],
            [105.65460306935353, 9.980267891044349],
            [105.65680108682693, 9.977357878171105],
            [105.6563206759642, 9.976820942816161],
            [105.65424994523482, 9.979927207958795]
          ]
        ]
      },
      properties: {
        owner: 'Huỳnh Thị Diễm',
        cropId: 'xoai'
      }
    },

    // ===== FARM 11 =====
    {
      type: 'Feature',
      id: 'farm-11',
      geometry: {
        type: 'Point',
        coordinates: [105.65723500032686, 9.975897871501733]
      },
      properties: {
        owner: 'Nguyễn Thành Đạt',
        cropId: 'dau',
        area: 1.3
      }
    },
    {
      type: 'Feature',
      id: 'farm-11-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65662590896477, 9.976323413329467],
            [105.65702943199176, 9.97665334801556],
            [105.6580039781723, 9.975461082458153],
            [105.65728068217862, 9.97515364220375],
            [105.65662590896477, 9.976323413329467]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thành Đạt', cropId: 'dau' }
    },

    // ===== FARM 12 =====
    {
      type: 'Feature',
      id: 'farm-12',
      geometry: {
        type: 'Point',
        coordinates: [105.72033995477072, 9.971278856979538]
      },
      properties: {
        owner: 'Phạm Ngọc Hân',
        cropId: 'xoai',
        area: 2.2
      }
    },
    {
      type: 'Feature',
      id: 'farm-12-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.71976782972024, 9.971676816880759],
            [105.72014972319215, 9.972069845498666],
            [105.72115809359445, 9.971085160003895],
            [105.72053161666196, 9.97063296438104],
            [105.72016259600406, 9.97103867263236],
            [105.72026986945144, 9.971169682480507],
            [105.71976782972024, 9.971676816880759]
          ]
        ]
      },
      properties: { owner: 'Phạm Ngọc Hân', cropId: 'xoai' }
    },

    // ===== FARM 13 =====
    {
      type: 'Feature',
      id: 'farm-13',
      geometry: {
        type: 'Point',
        coordinates: [105.67200309485318, 9.94270190163154]
      },
      properties: {
        owner: 'Trần Văn Tín',
        cropId: 'sau-rieng',
        area: 3.1
      }
    },
    {
      type: 'Feature',
      id: 'farm-13-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.67094769376905, 9.943302784628656],
            [105.67130954557047, 9.943558673270743],
            [105.67306313506197, 9.942133005428033],
            [105.67269200501124, 9.941813143198729],
            [105.67094769376905, 9.943302784628656]
          ]
        ]
      },
      properties: { owner: 'Trần Văn Tín', cropId: 'sau-rieng' }
    },

    // ===== FARM 14 =====
    {
      type: 'Feature',
      id: 'farm-14',
      geometry: {
        type: 'Point',
        coordinates: [105.61196762069193, 9.957921131321523]
      },
      properties: {
        owner: 'Lý Thị Thanh Thảo',
        cropId: 'mang-cut',
        area: 1.7
      }
    },
    {
      type: 'Feature',
      id: 'farm-14-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.60983822493768, 9.957037868000995],
            [105.6130537554389, 9.95985305333626],
            [105.61423992891355, 9.958909968954671],
            [105.61073857347759, 9.955883634994166],
            [105.60983822493768, 9.957037868000995]
          ]
        ]
      },
      properties: { owner: 'Lý Thị Thanh Thảo', cropId: 'mang-cut' }
    },

    // ===== FARM 15 =====
    {
      type: 'Feature',
      id: 'farm-15',
      geometry: {
        type: 'Point',
        coordinates: [105.69862186405645, 9.971606862291178]
      },
      properties: {
        owner: 'Võ Minh Quân',
        cropId: 'chom-chom',
        area: 2.0
      }
    },
    {
      type: 'Feature',
      id: 'farm-15-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.69800123033122, 9.971835136268624],
            [105.69917093687758, 9.971954606624962],
            [105.6993009042335, 9.971374321614249],
            [105.6980143847835, 9.97126338465688],
            [105.69800123033122, 9.971835136268624]
          ]
        ]
      },
      properties: { owner: 'Võ Minh Quân', cropId: 'chom-chom' }
    },

    // ===== FARM 16 =====
    {
      type: 'Feature',
      id: 'farm-16',
      geometry: {
        type: 'Point',
        coordinates: [105.7079, 10.0068]
      },
      properties: {
        owner: 'Nguyễn Thị Hồng Nhung',
        cropId: 'xoai',
        area: 2.6
      }
    },
    {
      type: 'Feature',
      id: 'farm-16-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.7075, 10.0066],
            [105.7084, 10.007],
            [105.7086, 10.0065],
            [105.7077, 10.0063],
            [105.7075, 10.0066]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thị Hồng Nhung', cropId: 'xoai' }
    },

    // ===== FARM 17 =====
    {
      type: 'Feature',
      id: 'farm-17',
      geometry: {
        type: 'Point',
        coordinates: [105.6942, 10.0441]
      },
      properties: {
        owner: 'Lê Quốc Bảo',
        cropId: 'sau-rieng',
        area: 3.4
      }
    },
    {
      type: 'Feature',
      id: 'farm-17-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6938, 10.0438],
            [105.6947, 10.0443],
            [105.695, 10.0438],
            [105.6941, 10.0435],
            [105.6938, 10.0438]
          ]
        ]
      },
      properties: { owner: 'Lê Quốc Bảo', cropId: 'sau-rieng' }
    },

    // ===== FARM 18 =====
    {
      type: 'Feature',
      id: 'farm-18',
      geometry: {
        type: 'Point',
        coordinates: [105.6749, 10.0492]
      },
      properties: {
        owner: 'Phan Thị Ánh Tuyết',
        cropId: 'dau',
        area: 1.4
      }
    },
    {
      type: 'Feature',
      id: 'farm-18-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6745, 10.049],
            [105.6753, 10.0494],
            [105.6756, 10.0489],
            [105.6747, 10.0487],
            [105.6745, 10.049]
          ]
        ]
      },
      properties: { owner: 'Phan Thị Ánh Tuyết', cropId: 'dau' }
    },

    // ===== FARM 19 =====
    {
      type: 'Feature',
      id: 'farm-19',
      geometry: {
        type: 'Point',
        coordinates: [105.6429, 9.9631]
      },
      properties: {
        owner: 'Trần Đức Long',
        cropId: 'mang-cut',
        area: 1.9
      }
    },
    {
      type: 'Feature',
      id: 'farm-19-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6425, 9.9629],
            [105.6434, 9.9633],
            [105.6436, 9.9628],
            [105.6427, 9.9626],
            [105.6425, 9.9629]
          ]
        ]
      },
      properties: { owner: 'Trần Đức Long', cropId: 'mang-cut' }
    },

    // ===== FARM 20 =====
    {
      type: 'Feature',
      id: 'farm-20',
      geometry: {
        type: 'Point',
        coordinates: [105.6298, 9.9565]
      },
      properties: {
        owner: 'Bùi Thị Cẩm Vân',
        cropId: 'chom-chom',
        area: 2.3
      }
    },
    {
      type: 'Feature',
      id: 'farm-20-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6294, 9.9563],
            [105.6302, 9.9567],
            [105.6305, 9.9562],
            [105.6296, 9.956],
            [105.6294, 9.9563]
          ]
        ]
      },
      properties: { owner: 'Bùi Thị Cẩm Vân', cropId: 'chom-chom' }
    },

    // ===== FARM 21 =====
    {
      type: 'Feature',
      id: 'farm-21',
      geometry: { type: 'Point', coordinates: [105.6842, 9.9821] },
      properties: { owner: 'Nguyễn Văn Trường', cropId: 'dau', area: 1.5 }
    },
    {
      type: 'Feature',
      id: 'farm-21-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6838, 9.9819],
            [105.6846, 9.9823],
            [105.6849, 9.9818],
            [105.6841, 9.9816],
            [105.6838, 9.9819]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn Trường', cropId: 'dau' }
    },

    // ===== FARM 22 =====
    {
      type: 'Feature',
      id: 'farm-22',
      geometry: { type: 'Point', coordinates: [105.6924, 9.9897] },
      properties: { owner: 'Võ Thị Thuỳ Dương', cropId: 'xoai', area: 2.4 }
    },
    {
      type: 'Feature',
      id: 'farm-22-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.692, 9.9895],
            [105.6929, 9.9899],
            [105.6932, 9.9894],
            [105.6923, 9.9892],
            [105.692, 9.9895]
          ]
        ]
      },
      properties: { owner: 'Võ Thị Thuỳ Dương', cropId: 'xoai' }
    },

    // ===== FARM 23 =====
    {
      type: 'Feature',
      id: 'farm-23',
      geometry: { type: 'Point', coordinates: [105.7018, 9.9683] },
      properties: { owner: 'Lê Anh Tuấn', cropId: 'chom-chom', area: 1.9 }
    },
    {
      type: 'Feature',
      id: 'farm-23-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.7014, 9.968],
            [105.7021, 9.9685],
            [105.7025, 9.968],
            [105.7017, 9.9678],
            [105.7014, 9.968]
          ]
        ]
      },
      properties: { owner: 'Lê Anh Tuấn', cropId: 'chom-chom' }
    },

    // ===== FARM 24 =====
    {
      type: 'Feature',
      id: 'farm-24',
      geometry: { type: 'Point', coordinates: [105.7153, 9.9746] },
      properties: { owner: 'Đặng Thị Ngọc Mai', cropId: 'mang-cut', area: 2.1 }
    },
    {
      type: 'Feature',
      id: 'farm-24-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.7149, 9.9743],
            [105.7156, 9.9748],
            [105.716, 9.9743],
            [105.7152, 9.9741],
            [105.7149, 9.9743]
          ]
        ]
      },
      properties: { owner: 'Đặng Thị Ngọc Mai', cropId: 'mang-cut' }
    },

    // ===== FARM 25 =====
    {
      type: 'Feature',
      id: 'farm-25',
      geometry: { type: 'Point', coordinates: [105.6679, 9.9564] },
      properties: { owner: 'Phạm Văn Sang', cropId: 'sau-rieng', area: 3.2 }
    },
    {
      type: 'Feature',
      id: 'farm-25-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6675, 9.9562],
            [105.6683, 9.9566],
            [105.6687, 9.9561],
            [105.6678, 9.9559],
            [105.6675, 9.9562]
          ]
        ]
      },
      properties: { owner: 'Phạm Văn Sang', cropId: 'sau-rieng' }
    },
    // ===== FARM 26 =====
    {
      type: 'Feature',
      id: 'farm-26',
      geometry: {
        type: 'Point',
        coordinates: [105.59487862662213, 9.997906993298038]
      },
      properties: { owner: 'Nguyễn Văn An', cropId: 'sau-rieng', area: 2.1 }
    },
    {
      type: 'Feature',
      id: 'farm-26-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.59442354259869, 9.999438105536115],
            [105.59549307859169, 9.999082358671316],
            [105.59534433517558, 9.996375879578736],
            [105.59425355012257, 9.996731629405986],
            [105.59442354259869, 9.999438105536115]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn An', cropId: 'sau-rieng' }
    },

    // ===== FARM 27 =====
    {
      type: 'Feature',
      id: 'farm-27',
      geometry: {
        type: 'Point',
        coordinates: [105.6160061760129, 9.982206808712519]
      },
      properties: { owner: 'Trần Thị Bích', cropId: 'sau-rieng', area: 1.8 }
    },
    {
      type: 'Feature',
      id: 'farm-27-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.61623141939401, 9.983669177474127],
            [105.6170695369351, 9.983567339173405],
            [105.61569348406903, 9.980674520214436],
            [105.61503026365347, 9.980916197988108],
            [105.61623141939401, 9.983669177474127]
          ]
        ]
      },
      properties: { owner: 'Trần Thị Bích', cropId: 'sau-rieng' }
    },

    // ===== FARM 28 =====
    {
      type: 'Feature',
      id: 'farm-28',
      geometry: {
        type: 'Point',
        coordinates: [105.62834578518346, 10.025701708177884]
      },
      properties: { owner: 'Lê Hoàng Minh', cropId: 'mang-cut', area: 2.4 }
    },
    {
      type: 'Feature',
      id: 'farm-28-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.62839334618297, 10.027114554545122],
            [105.62892444346267, 10.027059914239615],
            [105.62831407786535, 10.024312279055948],
            [105.62775127322283, 10.024320084870851],
            [105.62839334618297, 10.027114554545122]
          ]
        ]
      },
      properties: { owner: 'Lê Hoàng Minh', cropId: 'mang-cut' }
    },

    // ===== FARM 29 =====
    {
      type: 'Feature',
      id: 'farm-29',
      geometry: {
        type: 'Point',
        coordinates: [105.6411423089994, 10.046288718542765]
      },
      properties: { owner: 'Phạm Thị Thu', cropId: 'chom-chom', area: 1.5 }
    },
    {
      type: 'Feature',
      id: 'farm-29-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.64061105435081, 10.04639341416592],
            [105.64178430433822, 10.046691254585141],
            [105.64198595646553, 10.04613167533681],
            [105.64071094499877, 10.04590603829088],
            [105.6406192848437, 10.04632121033508],
            [105.64061105435081, 10.04639341416592]
          ]
        ]
      },
      properties: { owner: 'Phạm Thị Thu', cropId: 'chom-chom' }
    },

    // ===== FARM 30 =====
    {
      type: 'Feature',
      id: 'farm-30',
      geometry: {
        type: 'Point',
        coordinates: [105.65717526326702, 10.029377075228092]
      },
      properties: { owner: 'Võ Văn Hùng', cropId: 'dau', area: 2.0 }
    },
    {
      type: 'Feature',
      id: 'farm-30-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65619739617722, 10.030168899186364],
            [105.65702458316633, 10.030499426551287],
            [105.65790268732934, 10.029062720139535],
            [105.65775408508631, 10.028663633894325],
            [105.65699756457599, 10.028490696368948],
            [105.65619739617722, 10.030168899186364]
          ]
        ]
      },
      properties: { owner: 'Võ Văn Hùng', cropId: 'dau' }
    },

    // ===== FARM 31 =====
    {
      type: 'Feature',
      id: 'farm-31',
      geometry: {
        type: 'Point',
        coordinates: [105.67837447077005, 10.022401831318838]
      },
      properties: {
        owner: 'Nguyễn Thị Kim Ngân',
        cropId: 'sau-rieng',
        area: 0.9
      }
    },
    {
      type: 'Feature',
      id: 'farm-31-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6776684298004, 10.021759978497442],
            [105.67851148188936, 10.023427353493247],
            [105.67904530518717, 10.023040013510823],
            [105.67827266620327, 10.02137997977384],
            [105.6776684298004, 10.021759978497442]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thị Kim Ngân', cropId: 'sau-rieng' }
    },

    // ===== FARM 32 =====
    {
      type: 'Feature',
      id: 'farm-32',
      geometry: {
        type: 'Point',
        coordinates: [105.63569922989592, 9.994007997221836]
      },
      properties: { owner: 'Trần Quốc Khánh', cropId: 'chom-chom', area: 1.6 }
    },
    {
      type: 'Feature',
      id: 'farm-32-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6354349755801, 9.995213449582721],
            [105.63633132621834, 9.995130171642387],
            [105.6358577824854, 9.99274841351378],
            [105.63517283529984, 9.992939954148454],
            [105.6354349755801, 9.995213449582721]
          ]
        ]
      },
      properties: { owner: 'Trần Quốc Khánh', cropId: 'chom-chom' }
    },

    // ===== FARM 33 =====
    {
      type: 'Feature',
      id: 'farm-33',
      geometry: {
        type: 'Point',
        coordinates: [105.6551783661014, 10.010766371291623]
      },
      properties: { owner: 'Lê Thị Mỹ Linh', cropId: 'mang-cut', area: 0.8 }
    },
    {
      type: 'Feature',
      id: 'farm-33-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65298741031137, 10.010161389514948],
            [105.65631461860767, 10.012517076267017],
            [105.6572714628237, 10.011574803617918],
            [105.65413997266285, 10.00881221576661],
            [105.65298741031137, 10.010161389514948]
          ]
        ]
      },
      properties: { owner: 'Lê Thị Mỹ Linh', cropId: 'mang-cut' }
    },

    // ===== FARM 34 =====
    {
      type: 'Feature',
      id: 'farm-34',
      geometry: {
        type: 'Point',
        coordinates: [105.7014971360457, 9.973250794753977]
      },
      properties: { owner: 'Đặng Văn Phúc', cropId: 'dau', area: 2.7 }
    },
    {
      type: 'Feature',
      id: 'farm-34-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70116063612483, 9.973618426316662],
            [105.70147146491752, 9.973776958622594],
            [105.7018822029658, 9.972864030147093],
            [105.70147424017466, 9.972743763929557],
            [105.70116063612483, 9.973618426316662]
          ]
        ]
      },
      properties: { owner: 'Đặng Văn Phúc', cropId: 'dau' }
    },

    // ===== FARM 35 =====
    {
      type: 'Feature',
      id: 'farm-35',
      geometry: {
        type: 'Point',
        coordinates: [105.7027695349196, 9.973262330275247]
      },
      properties: { owner: 'Huỳnh Thị Diễm', cropId: 'sau-rieng', area: 3.0 }
    },
    {
      type: 'Feature',
      id: 'farm-35-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70233716151512, 9.97331620182311],
            [105.70260283673946, 9.973906220015095],
            [105.70337381582249, 9.973054541240202],
            [105.70276432560132, 9.972772358022581],
            [105.70233716151512, 9.97331620182311]
          ]
        ]
      },
      properties: { owner: 'Huỳnh Thị Diễm', cropId: 'sau-rieng' }
    },

    // ===== FARM 36 =====
    {
      type: 'Feature',
      id: 'farm-36',
      geometry: {
        type: 'Point',
        coordinates: [105.70213934733071, 9.972036438275943]
      },
      properties: { owner: 'Nguyễn Văn Trường', cropId: 'dau', area: 2.4 }
    },
    {
      type: 'Feature',
      id: 'farm-36-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.7016515074468, 9.972478976338877],
            [105.70225745593427, 9.972610473127787],
            [105.70262376377678, 9.971575355941255],
            [105.702024662165, 9.971480947695852],
            [105.7016515074468, 9.972478976338877]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn Trường', cropId: 'dau' }
    },

    // ===== FARM 37 =====
    {
      type: 'Feature',
      id: 'farm-37',
      geometry: {
        type: 'Point',
        coordinates: [105.69982283404254, 9.970323920549806]
      },
      properties: { owner: 'Trần Thị Cẩm Vân', cropId: 'xoai', area: 3.1 }
    },
    {
      type: 'Feature',
      id: 'farm-37-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.69946196317022, 9.970872441837372],
            [105.70006791165605, 9.970939876427991],
            [105.700228813232, 9.969759769089208],
            [105.69953264811187, 9.969723594844652],
            [105.69946196317022, 9.970872441837372]
          ]
        ]
      },
      properties: { owner: 'Trần Thị Cẩm Vân', cropId: 'xoai' }
    },

    // ===== FARM 38 =====
    {
      type: 'Feature',
      id: 'farm-38',
      geometry: {
        type: 'Point',
        coordinates: [105.70395490854361, 9.970662114617]
      },
      properties: { owner: 'Lê Quốc Bảo', cropId: 'mang-cut', area: 2.0 }
    },
    {
      type: 'Feature',
      id: 'farm-38-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70298232897915, 9.970479263731576],
            [105.70347766097711, 9.970951012623942],
            [105.70476766926134, 9.970812489821938],
            [105.70459197495683, 9.97040569229054],
            [105.70298232897915, 9.970479263731576]
          ]
        ]
      },
      properties: { owner: 'Lê Quốc Bảo', cropId: 'mang-cut' }
    },

    // ===== FARM 39 =====
    {
      type: 'Feature',
      id: 'farm-39',
      geometry: { type: 'Point', coordinates: [105.70156, 9.97088] },
      properties: {
        owner: 'Phan Thị Ánh Tuyết',
        cropId: 'chom-chom',
        area: 1.9
      }
    },
    {
      type: 'Feature',
      id: 'farm-39-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70114, 9.97062],
            [105.70186, 9.97111],
            [105.70223, 9.97051],
            [105.70148, 9.97027],
            [105.70114, 9.97062]
          ]
        ]
      },
      properties: { owner: 'Phan Thị Ánh Tuyết', cropId: 'chom-chom' }
    },

    // ===== FARM 40 =====
    {
      type: 'Feature',
      id: 'farm-40',
      geometry: { type: 'Point', coordinates: [105.70593, 9.97244] },
      properties: { owner: 'Bùi Văn Sang', cropId: 'sau-rieng', area: 3.6 }
    },
    {
      type: 'Feature',
      id: 'farm-40-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70548, 9.97218],
            [105.70622, 9.97269],
            [105.70661, 9.97203],
            [105.70583, 9.97178],
            [105.70548, 9.97218]
          ]
        ]
      },
      properties: { owner: 'Bùi Văn Sang', cropId: 'sau-rieng' }
    },

    // ===== FARM 41 =====
    {
      type: 'Feature',
      id: 'farm-41',
      geometry: {
        type: 'Point',
        coordinates: [105.69785392829655, 9.969920887153211]
      },
      properties: { owner: 'Nguyễn Văn Tài', cropId: 'dau', area: 2.4 }
    },
    {
      type: 'Feature',
      id: 'farm-41-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.69712973186239, 9.970420169234714],
            [105.69867468425542, 9.97034620161783],
            [105.69857812473003, 9.96936348738791],
            [105.69703317233837, 9.969553690372393],
            [105.69712973186239, 9.970420169234714]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn Tài', cropId: 'dau' }
    },

    // ===== FARM 42 =====
    {
      type: 'Feature',
      id: 'farm-42',
      geometry: {
        type: 'Point',
        coordinates: [105.65640200467466, 9.97996690084354]
      },
      properties: { owner: 'Trần Văn Hưng', cropId: 'sau-rieng', area: 3.6 }
    },
    {
      type: 'Feature',
      id: 'farm-42-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65585900296543, 9.980144486244725],
            [105.65618047646223, 9.980469213179617],
            [105.65696355293227, 9.979803522614247],
            [105.65660498633872, 9.979450381335567],
            [105.65585900296543, 9.980144486244725]
          ]
        ]
      },
      properties: { owner: 'Trần Văn Hưng', cropId: 'sau-rieng' }
    },

    // ===== FARM 43 =====
    {
      type: 'Feature',
      id: 'farm-43',
      geometry: {
        type: 'Point',
        coordinates: [105.65821959540828, 9.978788856953255]
      },
      properties: { owner: 'Lê Thị Thanh Thúy', cropId: 'mang-cut', area: 3.1 }
    },
    {
      type: 'Feature',
      id: 'farm-43-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65796970779138, 9.978945470774775],
            [105.65814711718167, 9.979103149803464],
            [105.65852789831251, 9.978740914084383],
            [105.65823365834757, 9.978365893150396],
            [105.65796970779138, 9.978945470774775]
          ]
        ]
      },
      properties: { owner: 'Lê Thị Thanh Thúy', cropId: 'mang-cut' }
    },

    // ===== FARM 44 =====
    {
      type: 'Feature',
      id: 'farm-44',
      geometry: {
        type: 'Point',
        coordinates: [105.65843827547198, 9.977106384745824]
      },
      properties: { owner: 'Phạm Văn Long', cropId: 'chom-chom', area: 2.9 }
    },
    {
      type: 'Feature',
      id: 'farm-44-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65795454983243, 9.977420908256505],
            [105.65837409181029, 9.977735431095866],
            [105.65900966660013, 9.976724023234624],
            [105.65841479364508, 9.9765451763963],
            [105.65795454983243, 9.977420908256505]
          ]
        ]
      },
      properties: { owner: 'Phạm Văn Long', cropId: 'chom-chom' }
    },

    // ===== FARM 45 =====
    {
      type: 'Feature',
      id: 'farm-45',
      geometry: {
        type: 'Point',
        coordinates: [105.65640200467466, 9.97996690084354]
      },
      properties: { owner: 'Nguyễn Thị Hồng Vân', cropId: 'xoai', area: 3.3 }
    },
    {
      type: 'Feature',
      id: 'farm-45-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65585900296543, 9.980144486244725],
            [105.65618047646223, 9.980469213179617],
            [105.65696355293227, 9.979803522614247],
            [105.65660498633872, 9.979450381335567],
            [105.65585900296543, 9.980144486244725]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thị Hồng Vân', cropId: 'xoai' }
    },

    // ===== FARM 46 =====
    {
      type: 'Feature',
      id: 'farm-46',
      geometry: {
        type: 'Point',
        coordinates: [105.65700643403488, 9.97846785280421]
      },
      properties: { owner: 'Đặng Văn Minh', cropId: 'sau-rieng', area: 4.0 }
    },
    {
      type: 'Feature',
      id: 'farm-46-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65673674704624, 9.978686425574907],
            [105.6572115085171, 9.978774961310293],
            [105.657276121025, 9.978326748904948],
            [105.65708228350104, 9.978196711857066],
            [105.65672551008504, 9.978354416373833],
            [105.65673674704624, 9.978686425574907]
          ]
        ]
      },
      properties: { owner: 'Đặng Văn Minh', cropId: 'sau-rieng' }
    },

    // ===== FARM 47 =====
    {
      type: 'Feature',
      id: 'farm-47',
      geometry: {
        type: 'Point',
        coordinates: [105.6542380973265, 9.977696901342753]
      },
      properties: { owner: 'Trần Thị Kim Ngân', cropId: 'dau', area: 2.2 }
    },
    {
      type: 'Feature',
      id: 'farm-47-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65414338130216, 9.978048645177225],
            [105.6547050410984, 9.978073600003555],
            [105.65505132755902, 9.977258409697882],
            [105.65429540955171, 9.977171067758448],
            [105.65364506668743, 9.977607777222318],
            [105.65371263477692, 9.977973780892881],
            [105.65411382030999, 9.977745028646964],
            [105.65414338130216, 9.978048645177225]
          ]
        ]
      },
      properties: { owner: 'Trần Thị Kim Ngân', cropId: 'dau' }
    },

    // ===== FARM 48 =====
    {
      type: 'Feature',
      id: 'farm-48',
      geometry: {
        type: 'Point',
        coordinates: [105.6542380973265, 9.977696901342753]
      },
      properties: { owner: 'Võ Văn Lộc', cropId: 'chom-chom', area: 3.0 }
    },
    {
      type: 'Feature',
      id: 'farm-48-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65414338130216, 9.978048645177225],
            [105.6547050410984, 9.978073600003555],
            [105.65505132755902, 9.977258409697882],
            [105.65429540955171, 9.977171067758448],
            [105.65364506668743, 9.977607777222318],
            [105.65371263477692, 9.977973780892881],
            [105.65411382030999, 9.977745028646964],
            [105.65414338130216, 9.978048645177225]
          ]
        ]
      },
      properties: { owner: 'Võ Văn Lộc', cropId: 'chom-chom' }
    },

    // ===== FARM 49 =====
    {
      type: 'Feature',
      id: 'farm-49',
      geometry: {
        type: 'Point',
        coordinates: [105.65303222439162, 9.978933159604848]
      },
      properties: { owner: 'Lê Văn Dũng', cropId: 'xoai', area: 3.7 }
    },
    {
      type: 'Feature',
      id: 'farm-49-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65295404150311, 9.979137790068819],
            [105.65351310270489, 9.979264365474094],
            [105.65379584630125, 9.978745406001906],
            [105.65277411376064, 9.978454282033184],
            [105.65254277809044, 9.978834008896811],
            [105.6526134639895, 9.97916310515427],
            [105.65295404150311, 9.979137790068819]
          ]
        ]
      },
      properties: { owner: 'Lê Văn Dũng', cropId: 'xoai' }
    },

    // ===== FARM 50 =====
    {
      type: 'Feature',
      id: 'farm-50',
      geometry: {
        type: 'Point',
        coordinates: [105.65556068531518, 9.976565793713842]
      },
      properties: {
        owner: 'Nguyễn Thị Bích Trâm',
        cropId: 'mang-cut',
        area: 3.2
      }
    },
    {
      type: 'Feature',
      id: 'farm-50-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.65505363208791, 9.97678174447637],
            [105.65564878336573, 9.976974557388417],
            [105.65602466838419, 9.976365268198123],
            [105.65551565742288, 9.97614160479246],
            [105.65505363208791, 9.97678174447637]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thị Bích Trâm', cropId: 'mang-cut' }
    },

    // ===== FARM 51 =====
    {
      type: 'Feature',
      id: 'farm-51',
      geometry: {
        type: 'Point',
        coordinates: [105.68798151099718, 9.970217665064535]
      },
      properties: { owner: 'Nguyễn Văn Khánh', cropId: 'dau', area: 2.6 }
    },
    {
      type: 'Feature',
      id: 'farm-51-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.68737538931447, 9.970674502254028],
            [105.68812415553373, 9.970764573352895],
            [105.68848996503704, 9.970297329188071],
            [105.6885585542883, 9.969723124715898],
            [105.68735949081236, 9.969628795811786],
            [105.68737538931447, 9.970674502254028]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn Khánh', cropId: 'dau' }
    },

    // ===== FARM 52 =====
    {
      type: 'Feature',
      id: 'farm-52',
      geometry: {
        type: 'Point',
        coordinates: [105.68369822855115, 9.96954739059315]
      },
      properties: { owner: 'Trần Thị Thu Hà', cropId: 'xoai', area: 3.5 }
    },
    {
      type: 'Feature',
      id: 'farm-52-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.68314186064464, 9.970244388560985],
            [105.68369206448648, 9.970362733262661],
            [105.68382038933345, 9.969759576626828],
            [105.68410497749835, 9.968775443439114],
            [105.68373185079287, 9.968594811076159],
            [105.68314186064464, 9.970244388560985]
          ]
        ]
      },
      properties: { owner: 'Trần Thị Thu Hà', cropId: 'xoai' }
    },

    // ===== FARM 53 =====
    {
      type: 'Feature',
      id: 'farm-53',
      geometry: {
        type: 'Point',
        coordinates: [105.68596738943533, 9.970062279213863]
      },
      properties: { owner: 'Lê Văn Tuấn', cropId: 'sau-rieng', area: 4.2 }
    },
    {
      type: 'Feature',
      id: 'farm-53-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.6852900254691, 9.97075282222606],
            [105.68629775291282, 9.97085581821888],
            [105.68648789016845, 9.969207878428577],
            [105.68579388919096, 9.969432597981935],
            [105.6852900254691, 9.97075282222606]
          ]
        ]
      },
      properties: { owner: 'Lê Văn Tuấn', cropId: 'sau-rieng' }
    },

    // ===== FARM 54 =====
    {
      type: 'Feature',
      id: 'farm-54',
      geometry: {
        type: 'Point',
        coordinates: [105.67921863005756, 9.967857214884468]
      },
      properties: { owner: 'Phạm Thị Ngọc Anh', cropId: 'mang-cut', area: 3.1 }
    },
    {
      type: 'Feature',
      id: 'farm-54-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.67931359317265, 9.968760981733908],
            [105.67829352630525, 9.968306038546231],
            [105.67900337605784, 9.966943969080546],
            [105.68026402469451, 9.967417870177187],
            [105.67931359317265, 9.968760981733908]
          ]
        ]
      },
      properties: { owner: 'Phạm Thị Ngọc Anh', cropId: 'mang-cut' }
    },

    // ===== FARM 55 =====
    {
      type: 'Feature',
      id: 'farm-55',
      geometry: {
        type: 'Point',
        coordinates: [105.68960871120393, 9.960896188894656]
      },
      properties: { owner: 'Võ Văn Hùng', cropId: 'chom-chom', area: 2.9 }
    },
    {
      type: 'Feature',
      id: 'farm-55-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.68943240321966, 9.961550835023786],
            [105.69054017904938, 9.961228122519358],
            [105.69023593075894, 9.960098626242498],
            [105.6889877326397, 9.96047512543592],
            [105.68884731035206, 9.96112823525172],
            [105.68943240321966, 9.961550835023786]
          ]
        ]
      },
      properties: { owner: 'Võ Văn Hùng', cropId: 'chom-chom' }
    },

    // ===== FARM 56 =====
    {
      type: 'Feature',
      id: 'farm-56',
      geometry: {
        type: 'Point',
        coordinates: [105.69830901307076, 9.961200171448311]
      },
      properties: { owner: 'Nguyễn Thị Mai', cropId: 'xoai', area: 3.8 }
    },
    {
      type: 'Feature',
      id: 'farm-56-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.69708649400832, 9.961466849648843],
            [105.69813944691651, 9.96226149356903],
            [105.6999855327054, 9.961426444195169],
            [105.69875480852619, 9.960187334405177],
            [105.69757878319734, 9.960658735423337],
            [105.69708649400832, 9.961466849648843]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Thị Mai', cropId: 'xoai' }
    },

    // ===== FARM 57 =====
    {
      type: 'Feature',
      id: 'farm-57',
      geometry: {
        type: 'Point',
        coordinates: [105.67542590952227, 9.953052782391609]
      },
      properties: { owner: 'Trần Văn Phúc', cropId: 'dau', area: 2.3 }
    },
    {
      type: 'Feature',
      id: 'farm-57-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.67451680387825, 9.952908860851167],
            [105.67463310935341, 9.953514161281419],
            [105.67629680397357, 9.953250405349067],
            [105.67625692088387, 9.952537702084783],
            [105.67451680387825, 9.952908860851167]
          ]
        ]
      },
      properties: { owner: 'Trần Văn Phúc', cropId: 'dau' }
    },

    // ===== FARM 58 =====
    {
      type: 'Feature',
      id: 'farm-58',
      geometry: {
        type: 'Point',
        coordinates: [105.71011771608065, 9.964608641823439]
      },
      properties: { owner: 'Lê Thị Cẩm Tú', cropId: 'mang-cut', area: 3.6 }
    },
    {
      type: 'Feature',
      id: 'farm-58-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70890759609398, 9.965238606851315],
            [105.70943723077369, 9.965788041932626],
            [105.71135171309987, 9.964052092517235],
            [105.71077432435504, 9.96335582599258],
            [105.70890759609398, 9.965238606851315]
          ]
        ]
      },
      properties: { owner: 'Lê Thị Cẩm Tú', cropId: 'mang-cut' }
    },

    // ===== FARM 59 =====
    {
      type: 'Feature',
      id: 'farm-59',
      geometry: {
        type: 'Point',
        coordinates: [105.70766285143031, 9.97682876978692]
      },
      properties: { owner: 'Nguyễn Văn Đạt', cropId: 'sau-rieng', area: 4.1 }
    },
    {
      type: 'Feature',
      id: 'farm-59-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70583099284784, 9.977065152950871],
            [105.70967118961471, 9.977607442076362],
            [105.70948765079794, 9.97646724338182],
            [105.70566157246077, 9.976175240738627],
            [105.70583099284784, 9.977065152950871]
          ]
        ]
      },
      properties: { owner: 'Nguyễn Văn Đạt', cropId: 'sau-rieng' }
    },

    // ===== FARM 60 =====
    {
      type: 'Feature',
      id: 'farm-60',
      geometry: {
        type: 'Point',
        coordinates: [105.70954139563237, 9.981880553989942]
      },
      properties: {
        owner: 'Phan Thị Thanh Hương',
        cropId: 'chom-chom',
        area: 3.0
      }
    },
    {
      type: 'Feature',
      id: 'farm-60-area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.70891381642593, 9.982062342174004],
            [105.71006086245444, 9.982503826842702],
            [105.71015315351292, 9.981750705577213],
            [105.70954666940764, 9.98150399305969],
            [105.70903247636085, 9.9815819022961],
            [105.70891381642593, 9.982062342174004]
          ]
        ]
      },
      properties: { owner: 'Phan Thị Thanh Hương', cropId: 'chom-chom' }
    }
  ]
};
