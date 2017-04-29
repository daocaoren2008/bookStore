var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
/*var express = require('express');
 var app = express();*/
function readBook(callback) {
    fs.readFile('./book.json', function (err, data) {
        if (err || data == '') {
            data = '[]';
        } else {
            data = JSON.parse(data);
        }
        callback(data);
    })
}
function writeBook(data, callback) {
    fs.writeFile('./book.json', JSON.stringify(data), callback)
}

var server = http.createServer(function (req, res) {
    let urlObj = url.parse(req.url, true);
    let {pathname, query}=urlObj;
    if (pathname == '/') {
        res.setHeader('content-Type', 'text/html;charset=utf8');
        fs.createReadStream('./index.html').pipe(res);
    } else if (/^\/book(\/\d+)?$/.test(pathname)) {
        var id = /^\/book(?:\/(\d+))?$/.exec(pathname)[1];
        switch (req.method) {
            case 'GET':
                if (id) {
                    readBook(function (data) {
                        var b = data.find(function (item) {
                            return item.bookId == id;
                        });
                        res.end(JSON.stringify(b));
                    })

                } else {
                    readBook(function (data) {
                        res.end(JSON.stringify(data));
                    })
                }
                break;
            case 'POST':
                var str = '';
                req.on('data', function (data) {
                    str += data;
                });
                req.on('end', function () {
                    var b = JSON.parse(str);
                    readBook(function (data) {
                        b.bookId = data.length > 0 ? parseInt(data[data.length - 1].bookId) + 1 : 1;
                        data.push(b);
                        writeBook(data, function () {
                            res.end(JSON.stringify(b));
                        })
                    })
                });
                break;
            case 'PUT':
                if (id) {
                    var str = '';
                    req.on('data', function (data) {
                        str += data;
                    });
                    req.on('end', function () {
                        var b = JSON.parse(str);
                        readBook(function (data) {
                            data = data.map(function (item) {
                                if (item.bookId == id) {
                                    return b
                                } else {
                                    return item
                                }
                            });
                            writeBook(data, function () {
                                res.end(JSON.stringify(b));
                            })

                        })
                    });

                }
                break;

            case 'DELETE':
                if (id) {
                    readBook(function (data) {
                        data = data.filter(function (item) {
                            return item.bookId != id;
                        });
                        writeBook(data, function () {
                            res.send({})
                        })
                    })
                }
                break;
        }

    } else {
        fs.exists('.' + pathname, function (exis) {
            if (exis) {
                res.setHeader('content-Type', mime.lookup(pathname) + ';charset=utf8');
                fs.createReadStream('.' + pathname).pipe(res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        })
    }
}).listen(80, function () {
    console.log(80)
});
