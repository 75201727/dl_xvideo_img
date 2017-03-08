var https = require('https');
var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');

var mkdirp = require('mkdirp');
const util = require('util');
var urls = [];

var pornArr = [
  "http://www.xvideos.com",
];

function getHtml(href) {
  var pageData = '';

  var req = http.get(href, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      pageData += chunk;
    });

    res.on('end', function() {

      //console.log(pageData);
      // https://stackoverflow.com/questions/24565800/how-do-get-script-content-using-cheerio
      $ = cheerio.load(pageData, {xmlMode: false});
      var html = $('script').get();

      // https://stackoverflow.com/questions/10729276/how-can-i-get-the-full-object-in-node-jss-console-log-rather-than-object
      //test

      //console.log(util.inspect(html, false, 4));
      // http://img-egc.xvideos.com/videos/thumbs169ll/68/17/0a/68170a4bfbf6ed0252fad43362ddad03/mozaiquehome.jpg
      for(var i = 0; i < html.length; i++) {
        var childrenArr = html[i].children;
        if(childrenArr.length > 0) {
          let mydata = html[i].children[0].data;
          // https://stackoverflow.com/questions/37645945/how-to-get-image-url-from-html-string-using-regex
          let re = /<img\b(?=\s)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\ssrc=['"]([^"]*)['"]?)(?:[^>=]|='[^']*'|="[^"]*"|=[^'"\s]*)*"\s?\/?>/;
          let matches = mydata.match(re);
          if(matches !== null) {
            //test
            //console.log("--- start ---");
            //console.log(matches[1]);
            //console.log("--- end ---");
            //console.log();
            // small: http://img-egc.xvideos.com/videos/thumbs169/0a/d3/32/0ad332719d82ae16ed318269b131574c/0ad332719d82ae16ed318269b131574c.4.jpg
            // bigger: http://img-egc.xvideos.com/videos/thumbs169ll/0a/d3/32/0ad332719d82ae16ed318269b131574c/0ad332719d82ae16ed318269b131574c.4.jpg
            let myurl = matches[1];
            let arr = myurl.split("/");
            /*
            [ 'videos',
              'thumbs169',
              'bc',
              '5d',
              '02',
              'bc5d02a383ea63ac9a1dbf05fd093103',
              'bc5d02a383ea63ac9a1dbf05fd093103.1.jpg' ]
            */

            let newMyurl =
              'http://img-egc.xvideos.com/' +
              arr[3] + "/" +
              arr[4] + "ll/" +
              arr[5] + "/" +
              arr[6] + "/" +
              arr[7] + "/" +
              arr[8] + "/" +
              arr[9];

            //console.log(newMyurl);
            urls.push(newMyurl);
          }
          else {

          }
        }
        else {
          continue;
        }
      }

      if (true) {
        //
        console.log("img url num: " + urls.length);
        //
        console.log("total: " + urls.length);
        // url length
        if (urls.length > 0) {
					// array remove, get the first element and pass down
					// then inside we recursive.
          downImg(urls.shift());
        } else {
          console.log("------- finish done ----------");
        }
      }
    });
  });
}


/**
 * dl image
 * @param {String} imgurl, url
 */
function downImg(imgurl) {
  var tmpImgUrl = imgurl;
  var narr = imgurl.replace("http://img-egc.xvideos.com/", "").split("/")

  http.get(tmpImgUrl, function(res) {
    var imgData = "";
		// need binary, otherwise cannot see img
    res.setEncoding("binary");

		// res on data
		//
    res.on("data", function(chunk) {
      imgData += chunk;
    });

		// end
    res.on("end", function() {
      //console.log("");
      //console.log(narr);

			// buld the path we want
      var savePath = __dirname + "/upload/tmp/" + narr[5];
      // now write
      fs.writeFile(savePath, imgData, "binary", function(err) {
        if(err) {
          console.log(err);
        }  else {
          console.log(savePath);
          if (urls.length > 0) {
            // goging down
            downImg(urls.shift());
          } else {
            console.log("finish dl img");
          }
        }
      });
    });
  });
}


//
function start() {
  console.log("--- starting ---");

  // https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
  mkdirp(__dirname + '/upload/tmp', function (err) {
    if (err) console.error(err);
    else console.log('dir created!')

    // get it
    for (var i=0; i < pornArr.length; i++) {
      getHtml(pornArr[i]);
    }
  });
}

start();
