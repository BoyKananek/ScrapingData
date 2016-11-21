var express = require('express');
var request = require('request');
var events = require('events');
var path = require('path');
var cheerio = require('cheerio');
var fs = require('fs');
var eventEmitter = new events.EventEmitter();
var port = 8080;
var app = express();

app.get('/seriesubthai/:pagenum', function (req, res) {
    var url = "http://www.seriesubthai.co/category/usa-series/page/" + req.params.pagenum;
    request(url, function (err, res, html) {
        if (!err) {
            var $ = cheerio.load(html);
            var seriesName = $('.post-ddtemplate-title h3').map(function () {
                return $(this).text();
            }).toArray();
            console.log(seriesName);

            var seriesShortStory = $('.post-ddtemplate-excerpt').map(function () {
                return $(this).text();
            }).toArray();
            console.log(seriesShortStory);
        }
    });
    res.end('Seriesubthai Movie');
})


//get job position and company with seatch keyword
app.get('/jobsdb/:key', function (req, res) {
    var url = "http://th.jobsdb.com/TH/EN/Search/FindJobs?KeyOpt=COMPLEX&JSRV=1&RLRSF=1&JobCat=131&SearchFields=Positions,Companies&Key=" + req.params.key;
    var nextUrl = "";
    var count = 0;
    request(url, function (err, res, html) {
        if (!err) {
            count ++;
            var $ = cheerio.load(html);
            var position = $('h3.job-title a').map(function () {
                return $(this).text();
            }).toArray();
            var company = $("meta[itemprop='name']").map(function () {
                return $(this).attr('content');
            }).toArray();
            console.log('Position');
            console.log(position);
            console.log('Company');
            console.log(company);
            var lengthPage = $('div.paging menu.box li').length;
       
            var nextpage = $('div.paging menu.box li a.pagebox-next').attr('href');
            console.log(nextpage);
            console.log('Page number : '+ count );
            if (nextpage != undefined) {
                nextUrl = nextpage;
                eventEmitter.emit('NextDB');
            }else{
                console.log('Complete');
                eventEmitter.removeAllListeners();
            }
        }
    });
    eventEmitter.on('NextDB', function () {
        count++;
        request(nextUrl, function (err, res, html) {
            if (!err) {
                var $ = cheerio.load(html);
                var position = $('h3.job-title a').map(function () {
                    return $(this).text();
                }).toArray();
                var company = $("meta[itemprop='name']").map(function () {
                    return $(this).attr('content');
                }).toArray();
                if(position.length > 0){
                    console.log('Position');
                    console.log(position);
                    console.log('Company');
                    console.log(company);
                    console.log('Page number : '+ count );
                    var lengthPage = $('div.paging menu.box li').length;
                    var nextpage = $('div.paging menu.box li a.pagebox-next').attr('href');
                    if (nextpage != undefined){
                        nextUrl = nextpage;
                        eventEmitter.emit('NextDB');
                    }else{
                        console.log('Complete !!');
                    }
                }else{
                    console.log('Complete !!!');
                }
                
            }
        });
    })
    res.end('Job DB search ');
})
//get youtube link and name with search keyword
app.get('/youtube/:search', function (req, res) {
    var url = 'https://www.youtube.com/results?search_query=' + req.params.search;
    var nextUrl = "";
    var count = 0;
    var textNextPage = "";
    request(url, function (err, res, html) {
        if (!err) {
            count++;
            var $ = cheerio.load(html);
            console.log('Youtube');
            var link = $('h3.yt-lockup-title a').map(function () {
                return $(this).attr('href');
            }).toArray();
            var name = $('h3.yt-lockup-title a').map(function () {
                return $(this).text();
            }).toArray();
            console.log(req.params.search);
            console.log("Link :");
            console.log(link);
            console.log("Video Name :");
            console.log(name);
            console.log('Page number :' + count);
            var lengthPage = $('div.branded-page-box a').length
            var nextPage = $('div.branded-page-box a').eq(lengthPage - 1).attr('href');
            textNextPage = $('div.branded-page-box a span.yt-uix-button-content').eq(lengthPage - 1).text();
            if (textNextPage == 'Next »' || textNextPage == 'ถัดไป »') {
                nextUrl = 'https://www.youtube.com/' + nextPage;
                eventEmitter.emit('NextYB');
                textNextPage = "";
            }

        }
    });
    //create infinity loop to got into next page over and over again 
    eventEmitter.on('NextYB', function () {
        count++;
        request(nextUrl, function (err, res, html) {
            if (!err) {
                var $ = cheerio.load(html);
                var link = $('h3.yt-lockup-title a').map(function () {
                    return $(this).attr('href');
                }).toArray();
                var name = $('h3.yt-lockup-title a').map(function () {
                    return $(this).text();
                }).toArray();
                if (link.length > 0) {
                    console.log(req.params.search);
                    console.log("Link :");
                    console.log(link);
                    console.log("Video Name :");
                    console.log(name);
                    console.log('Page number :' + count);
                    var lengthPage = $('div.branded-page-box a').length
                    var nextPage = $('div.branded-page-box a').eq(lengthPage - 1).attr('href');
                    textNextPage = $('div.branded-page-box a span.yt-uix-button-content').eq(lengthPage - 1).text();
                    if (textNextPage == 'Next »' || textNextPage == 'ถัดไป »') {
                        nextUrl = 'https://www.youtube.com/' + nextPage;
                        eventEmitter.emit('NextYB');
                        textNextPage = "";
                    }
                } else {
                    console.log('Complete !!!!');
                    eventEmitter.removeAllListeners();
                }
            }
        })
    });
    res.end('Youtube');
});


app.listen(port);
console.log('Magic happens on port ' + port);