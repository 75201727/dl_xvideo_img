var https = require('https');
var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');

var mkdirp = require('mkdirp');  
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
      $ = cheerio.load(pageData);
      var html = $("img");

      console.log(html);

      // http://img-egc.xvideos.com/videos/thumbs169ll/68/17/0a/68170a4bfbf6ed0252fad43362ddad03/mozaiquehome.jpg
      for(var i = 0; i < html.length; i++) {
        var src = html[i].attribs.src;
        
        /*
        // not https, http
        if (src.indexOf("http://img-egc.xvideos.com/") > -1) {
          
        }
        */
        urls.push(html[i].attribs.src);
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
      console.log("");
      console.log(narr);
    
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
