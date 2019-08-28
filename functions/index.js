const functions = require('firebase-functions');
const request = require('request-promise');
//API
const express = require('express');
const cors = require('cors');
const app = express();

const admin = require('firebase-admin');
admin.initializeApp();

const region = 'asia-east2';
const runtimeOpts = {
  timeoutSeconds: 90,
  memory: "2GB"
};

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer vJNwfAOPRSN1YOxKN8DsJQ7BziBFewoHf0ckwlrLPjNV+effkBtGBGseE6cEEkQnEhjxYFjlC4rcf6ZXm5xUsBccANAzbWW52ZOwKzDWRsjjpJ773obGwjWCFn1RjxFWJjVZddLLlP52WaWkOYt5QAdB04t89/1O/w1cDnyilFU=`
};
exports.LineBot = functions.region(region).runWith(runtimeOpts).https.onRequest(async (req, res) => {
  //exports.LineBot = functions.https.onRequest((req, res) => {
  if (req.method === "POST") {
    let event = req.body.events[0];
    switch (event.type) {
      case 'message':
        if (event.message.type === 'text' && event.message.text === 'จ่ายเงินผ่านคิวอาร์โค้ด') {
          let latest = await admin.firestore().doc('users/' + event.source.userId).get()
          if (latest.data().amount < 20) {
            reply(event.replyToken, {
              type: 'text',
              text: 'กรุณาเติมเงินแหน่ ตอนนี้ยอดเงินคงเหลือ ' + latest.data().amount + ' บาท บ่พอจ่ายค่ารถ อิอิ'
            })
          } else {
            reply(event.replyToken, {
              "type": "flex",
              "altText": "Message",
              "contents": {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": "https://scontent.fbkk10-1.fna.fbcdn.net/v/t1.0-9/13177671_1087528454639830_6646398039897813675_n.png?_nc_cat=103&_nc_eui2=AeFtWadcbQ33S4aePZCsS3OFIV0HkggCk3BY8dcVQPf2nOuXMEWNHis1CO2tKpkny1bL-qfLi-oaLxnwDfH3eFQgEa6nYEFiVn_FZJz5fmTJ_g&_nc_oc=AQl8yVinYzcRRJuRjzzt0twUkxZzn8MoouJQzke6vggk1pdZFquG87Coa9Sa4qLSS8c&_nc_ht=scontent.fbkk10-1.fna&oh=3f7d39e7fb3f2bd90ab33722d29a900e&oe=5DD2D7C6",
                  "size": "full",
                  "aspectRatio": "5:5",
                  "aspectMode": "cover",
                  "action": {
                    "type": "uri",
                    "uri": "https://khonkaencitybus.com/"
                  }
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "md",
                  "contents": [
                    {
                      "type": "text",
                      "text": "สแกนเพื่อจ่ายเงิน",
                      "wrap": true,
                      "weight": "bold",
                      "gravity": "center",
                      "size": "xl"
                    },
                    {
                      "type": "box",
                      "layout": "baseline",
                      "margin": "md",
                      "contents": [
                        {
                          "type": "icon",
                          "size": "sm",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                        },
                        {
                          "type": "icon",
                          "size": "sm",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                        },
                        {
                          "type": "icon",
                          "size": "sm",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                        },
                        {
                          "type": "icon",
                          "size": "sm",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                        },
                        {
                          "type": "icon",
                          "size": "sm",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
                        },
                        {
                          "type": "text",
                          "text": "4.0",
                          "size": "sm",
                          "color": "#999999",
                          "margin": "md",
                          "flex": 0
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "margin": "xxl",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "image",
                          "url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + event.source.userId,
                          "aspectMode": "cover",
                          "size": "xl"
                        },
                        {
                          "type": "text",
                          "text": "คิวอาร์โค้ดมีอายุ 15 นาที",
                          "color": "#aaaaaa",
                          "wrap": true,
                          "margin": "xxl",
                          "size": "xs"
                        }
                      ]
                    }
                  ]
                }
              }
            });
          }


        } else if (event.message.type === 'text' && event.message.text === 'เริ่มต้นใช้งาน') {
          await admin.firestore().doc('users/' + event.source.userId).set({
            UID: event.source.userId,
            amount: 100
          })

          reply(event.replyToken, {
            type: 'text',
            text: 'บันทึกข้อมูลเรียบร้อย และเพิ่มโบนัสให้ 100 บาท'
          })
        }
        else if (event.message.type === 'text' && event.message.text === 'เช็คยอดเงิน') {

          let latest = await admin.firestore().doc('users/' + event.source.userId).get()
          reply(event.replyToken, {
            type: 'text',
            text: 'ตอนนี้ยอดเงินคงเหลือ ' + latest.data().amount + ' บาท'
          })
        }
        else {
          // [8.1]
        }
        break;
      case 'postback': {
        // [8.4]
        break;
      }
    }

  }
  return null;
});


const postToDialogflow = req => {
  req.headers.host = "bots.dialogflow.com";
  return request.post({
    uri: "https://bots.dialogflow.com/line/9245b4db-6082-4457-95c5-4b232bd439ab/webhook",
    headers: req.headers,
    body: JSON.stringify(req.body)
  });
};
const doImage = async (event) => {
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let url = `${LINE_MESSAGING_API}/${event.message.id}/content`;
  if (event.message.contentProvider.type === 'external') {
    url = event.message.contentProvider.originalContentUrl;
  }
  //reply(event.replyToken, { type: 'text', text: 'ขอคิดแป๊บนะเตง...' });

  let buffer = await request.get({
    headers: LINE_HEADER,
    uri: url,
    encoding: null
  });

  const tempLocalFile = path.join(os.tmpdir(), 'temp.jpg');
  await fs.writeFileSync(tempLocalFile, buffer);

  const bucket = admin.storage().bucket("hw-project-f7b2c.appspot.com");
  await bucket.upload(tempLocalFile, {
    destination: `${event.source.userId + event.timestamp}.jpg`,
    metadata: { cacheControl: 'no-cache' }
  });

  fs.unlinkSync(tempLocalFile)
  reply(event.replyToken, { type: 'text', text: 'ขอคิดแป๊บนะเตง...' });
}
// Reply Message
const reply = (token, payload) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: token,
      messages: [payload]
    })
  })
};

let db = admin.firestore();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
// build multiple CRUD interfaces:
app.get('/test', (req, res) => {
  
});
app.get('/:id', (req, res) => {
  // Create a reference to the SF doc.
  var newPopulation = 0;
  var priceFare =20;
  var userOneDocumentRef = db.collection('users').doc(req.params.id);
  return db.runTransaction(function (transaction) {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(userOneDocumentRef).then(function (sfDoc) {
      if (sfDoc.data().amount >= priceFare) {
        newPopulation = sfDoc.data().amount - priceFare;
        transaction.update(userOneDocumentRef, { amount: newPopulation });
        return request({
          method: "POST",
          uri: `${LINE_MESSAGING_API}/push`,
          headers: LINE_HEADER,
          body: JSON.stringify({
            to: req.params.id,
            messages: [
              {
                "type": "flex",
                "altText": "ใบเสร็จ",
                "contents": {
      
                  "type": "bubble",
                  "styles": {
                    "footer": {
                      "separator": true
                    }
                  },
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ใบเสร็จ",
                        "weight": "bold",
                        "color": "#1DB446",
                        "size": "sm"
                      },
                      {
                        "type": "text",
                        "text": "City BUS",
                        "weight": "bold",
                        "size": "xxl",
                        "margin": "md"
                      },
                      {
                        "type": "text",
                        "text": "Miraina Tower, 4-1-6 Shinjuku, Tokyo",
                        "size": "xs",
                        "color": "#aaaaaa",
                        "wrap": true
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "ค่าโดยสาร",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                              },
                              {
                                "type": "text",
                                "text": "฿ "+priceFare,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
      
                          {
                            "type": "separator",
                            "margin": "xxl"
                          },
      
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "จ่าย",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "฿ "+priceFare,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "คงเหลือ",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "฿ "+newPopulation,
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "text",
                            "text": "PAYMENT ID",
                            "size": "xs",
                            "color": "#aaaaaa",
                            "flex": 0
                          },
                          {
                            "type": "text",
                            "text": "#"+req.params.id,
                            "color": "#aaaaaa",
                            "size": "xs",
                            "align": "end"
                          }
                        ]
                      }
                    ]
                  }
      
                }
                
              }
            ]
          })
        }).then(() => {
          return res.send("Done");
        }).catch(error => {
          return Promise.reject(error);
        });
      } else {
        res.status(200).send('old amount: ' + sfDoc.data().amount);
      }

    });
  }).then(function () {
    res.status(201).send('new amount: ' + newPopulation);
    console.log("Transaction successfully committed!");
  }).catch(function (error) {
    console.log("Transaction failed: ", error);
    res.status(400).send('cannot connect!!!' + error)
  });
});
app.put('/:id', (req, res) => {
  res.send(req.body + ' Hello POST by noomerZx ' + req.params.id)
});
app.patch('/', (req, res) => {
  res.send('Hello PATCH by noomerZx')
});
app.delete('/', (req, res) => {
  res.send('Hello DELETE by noomerZx')
});
// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);