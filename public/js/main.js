'use strict';

$(document).ready(function () {
    // jquery scroll up
    $.scrollUp();

    // header script
    if ($(window).width() < 1200) {
        $('.col-right').insertAfter('.menu-wrap');
        $('.search').insertAfter('.menu');
    }

    $('.btn-showmenu').click(function () {
        $('.menu').toggleClass('open');
        $('.overlay').fadeToggle(500);
    });
    $('.btn-showsub').click(function () {
        $(this).siblings('.mega').slideToggle(500);
    });
    $('.btn-showsub').click(function () {
        $(this).siblings('.sub').slideToggle(500);
    });
    $('.overlay').click(function () {
        $('.menu').removeClass('open');
        $(this).fadeOut(500);
    });

    // header scroll event
    $(window).bind('scroll', function () {
        if ($(window).scrollTop() > 100) {
            $('header').addClass('minimal');
        } else {
            $('header').removeClass('minimal');
        }
    });

    // breadcrumb script
    // $(".pagename").append($('.breadcrumb li a').eq(1).find('span').html());

    // page scroll to id
    $(".page-scroll a").mPageScroll2id({
        forceSingleHighlight: true,
        offset: 100
    });

    // toggle category mobile
    $('.cate-toggle').click(function () {
        $(this).siblings('ul').slideToggle(200);
    });
    if ($(window).width() < 1200) {
        $('.page-scroll li').click(function () {
            $('.page-scroll ul').slideUp(200);
        });
    }

    // banner
    $('.banner-slide').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        dots: false,
        fade: true,
        asNavFor: '.banner-nav'
    });
    $('.banner-nav').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.banner-slide',
        arrows: true,
        dots: false,
        centerMode: true,
        focusOnSelect: true,
        centerPadding: '0px',
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 1
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 1
            }
        }]
    });

    // product slick
    $('.product-slick').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 4
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 1
            }
        }]
    });

    // history slick
    $('.history-slick').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        infinite: false,
        // autoplay: true,
        // autoplaySpeed: 3000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 5
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 4
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 575,
            settings: {
                slidesToShow: 2
            }
        }]
    });

    // award slick
    $('.award-slick').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        infinite: false,
        // autoplay: true,
        // autoplaySpeed: 3000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 5
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 4
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 575,
            settings: {
                slidesToShow: 2
            }
        }]
    });

    // place slick
    $('.place-slick').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        infinite: false,
        // autoplay: true,
        // autoplaySpeed: 3000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 575,
            settings: {
                slidesToShow: 1
            }
        }]
    });

    // product support
    $('.support-slick').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 1
            }
        }]
    });

    // faq script
    $('.faq .faq-title').click(function () {
        if ($(this).parent().hasClass('active') == true) {
            $(this).parent().removeClass('active');
            $(this).parent().find('.faq-content').slideUp(300);
        } else {
            $('.faq').removeClass('active');
            $('.faq').find('.faq-content').slideUp(300);
            $(this).parent().addClass('active');
            $(this).parent().find('.faq-content').slideDown(300);
        }
    });

    // news slick
    $('.news-slick').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        adaptiveHeight: true,
        speed: 1000,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }]
    });

    // store slick
    $('.store-slick').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        arrows: true,
        dots: false,
        centerPadding: '200px',
        infinite: false,
        responsive: [{
            breakpoint: 1199,
            settings: {
                centerPadding: '150px'
            }
        }, {
            breakpoint: 991,
            settings: {
                centerPadding: '100px'
            }
        }, {
            breakpoint: 767,
            settings: {
                centerPadding: '70px'
            }
        }]
    });

    // project slide
    var $status = $('.slide-pagination');

    $('.project-slide').on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
        //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
        var i = (currentSlide ? currentSlide : 0) + 1;
        $status.text(i + '/' + slick.slideCount);
    });

    $('.project-slide').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        fade: true,
        autoplay: true,
        autoplaySpeed: 3000,
        asNavFor: '.project-nav'
    });

    $('.project-nav').slick({
        slidesToShow: 3,
        slidesToScroll: 3,
        asNavFor: '.project-slide',
        dots: false,
        centerMode: true,
        centerPadding: '0px',
        arrows: true,
        focusOnSelect: true,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }]
    });

    // project slick
    $('.project-slick').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 2
            }
        }]
    });

    // product slide
    $('.product-slide').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        fade: true,
        autoplay: true,
        autoplaySpeed: 5000,
        asNavFor: '.product-nav'
    });

    $('.product-nav').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: '.product-slide',
        dots: false,
        arrows: true,
        focusOnSelect: true,
        vertical: true,
        responsive: [{
            breakpoint: 1199,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 991,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1
            }
        }]
    });

    // tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Responsive tabs
    $('#responsivetabs').responsiveTabs({
        startCollapsed: 'accordion',
        animation: 'slide'
    });

    // career script
    $('.job .job-title').click(function () {
        if ($(this).parent().hasClass('active') == true) {
            $(this).parent().removeClass('active');
            $(this).parent().find('.job-content').slideUp(500);
        } else {
            $('.job').removeClass('active');
            $('.job').find('.job-content').slideUp(500);
            $(this).parent().addClass('active');
            $(this).parent().find('.job-content').slideDown(500);
        }
    });

    $(".footer-link a").mPageScroll2id({
        forceSingleHighlight: true,
        offset: 100
    });

    $('.header-wrap .search .search-toggle').before("<div class='login-button'><a href='https://www.cathaylife.com.vn/CPWeb/html/CP/Z0/CPZ0_0100/CPZ00100.html'><i class='fa fa-user' ></i></a></div>")

    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return decodeURI(results[1]) || 0;
        }
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    var curLang = $.urlParam('lang');
    if (curLang != null) {
        if (curLang == 'vi') {
            $('#en').removeClass('active');
            $('#vi').addClass('active');
        } else if (curLang == 'en') {
            $('#vi').removeClass('active');
            $('#en').addClass('active');
        }
    } else {
        //    	curLang = $.cookie("localeInfo");
        curLang = readCookie('localeInfo');
        if (curLang == 'vi') {
            $('#en').removeClass('active');
            $('#vi').addClass('active');
        } else if (curLang == 'en') {
            $('#vi').removeClass('active');
            $('#en').addClass('active');
        }
    }

    //    $('#en').click(function(e){
    //    	e.preventDefault();
    //    	$('#vi').removeClass('active');
    //    	$('#en').addClass('active');
    //    	let url = $(location).attr('href');
    //    	url += '/en';
    //    	url = url.replace('//en', '/en');
    //    	$(location).attr('href', url);
    //    });
    //    $('#vi').click(function(){
    //    	$('#en').removeClass('active');
    //    	$('#vi').addClass('active');
    //    	let url = $(location).attr('href');
    //    	url = url.replace('/en', '');
    //    	$(location).attr('href',url);
    //    });	
});