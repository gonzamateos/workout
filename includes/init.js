
/* For Quotes */
var rotateDegrees = 0;
var rotateSpeed = 5;
var quotesCant = 0;
/* For Workout */
var maxSegs = 900; //tiempo maximo q puede registrarse por ejercicio.
var curTimestamp = 0;
var curSession = 0;
var curWorkout = 0;
var curEx = 0;
var inWorkout = false;
/* For Settings */
var profile_img = '';
var profile;
var notifications = null;

/* etc */
var onweb = true;
var popup_opened;
var videoPlayer;

var basepath_;
var apppath_;

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("backbutton", backfunction, false);

function onDeviceReady() {
    // Alert Bienvenida
    console.log("Este es un prototipo de la aplicación. Los datos no son reales y las funcionalidades no se encuentran implementadas.");
    
    //basepath_ = 'file:///storage/emulated/0/workout/';
    
    
    /* Permisos */
    $.mobile.allowCrossDomainPages = true;
    $.mobile.defaultPageTransition   = 'slide';

    /* Insert Inicial*/
    dbController = new DBController();
    dbController.init("workout");

    loadSession();
    loadMenu();
    loadTips();
    loadQuotes();
    loadProfile();
    loadNotifications();
    eventListener();
    rotateRefresh();  
    videoPlayer = document.getElementById("wvideo");
    basepath_ = cordova.file.dataDirectory+'workout/';
    apppath_ = cordova.file.applicationDirectory;
    //alert('base: '+basepath_);
    //alert('app: '+path_);
    
    correctProfileImg();
    
}
function backfunction(e){
    
    e.preventDefault();
    var currentPageId = $.mobile.activePage.attr('id');
    if(currentPageId === 'home') {
        try{
            navigator.app.exitApp();
        }catch(e){
            console.log('Exit app...');
        }
    }else{
        try{
            $.mobile.changePage( "#home", { allowSamePageTransition: true, transition: 'slide', reverse: true } );
            //navigator.app.backHistory();
        }catch(e){
            console.log('Error trying back...');
        }
    }
     
} 
function loadMenu(){
    $('.loadmenu').html('<div class="footer-links">'
            +'<a href="#nogo" class="workout" rel="workout">Workout</a>'
            +'    <a href="#nogo" class="statistics" rel="statistics">Statistics</a>'
            +'    <a href="#nogo" class="tips" rel="tips">Tips</a>'
            +'    <a href="#nogo" class="configuration" rel="configuration">Configuration</a>'
            +'</div>'
            +'<div class="footer-menu">'
            +'    <div class="workout">'
            +'        <a href="#nogo" class="workout-for-today">Workout for today</a>'
            +'        <a href="#nogo" class="workout-random">Random workout</a>'
            +'        <a href="#workout" class="continue-training">Continue training</a>'
            +'        <a href="#nogo" class="strech">Strech</a>'
            +'        <a href="#nogo" class="leave">Leave training</a>'
            +'        <a href="#nogo" class="empty">&nbsp;</a>'
            +'    </div>'
            +'    <div class="statistics">'
            +'        <a href="#statistics-sesion" class="statistics-sesion">Sesion actual</a>'
            +'        <a href="#statistics-week" class="statistics-week">Acumulado semanal</a>'
            +'        <a href="#statistics-month" class="statistics-month">Acumulado mensual</a>'
            +'        <a href="#statistics-total" class="statistics-total">Acumulado total</a>'
            +'    </div>'
            +'    <div class="tips">'
            +'        <a href="#tips" class="tips">Tips</a>'
            +'        <a href="#motivation-quotes" class="motivation-quotes">Motivation quotes</a>'
            +'        <a href="#nogo" class="empty">&nbsp;</a>'
            +'    </div>'
            +'    <div class="configuration">'
            +'        <a href="#set-notification" class="set-notification">Set notification</a>'
            +'        <a href="#profile" class="options">Options</a>'
            +'        <a href="#about" class="about">About</a>'
            +'        <a href="#reset-progress" class="reset-progress">Reset progress</a>'
            +'    </div>'
            +'</div>');
    
        if(inWorkout){
            $('.strech, .leave').show();
            $('.workout-for-today, .workout-random').hide();
        }else{
            $('.workout-for-today, .workout-random').show();
            $('.strech, .leave').hide();
        }
}