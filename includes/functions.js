function eventListener(){
    
    $(".ui-content").on("click", function() {
        hideFooterTabs();
        return false;
    });
    $(".notifications .set-time").on("click", function() {
        var $li = $(this).parent('li');

        $li.find('a').removeClass('off').addClass('on');
        $li.find('input.active').val(1);
        
        $('#notification-popup-time').val($li.find('input.notification-time').val());
        $('#notification-caller').val($li.find('input.notification-time').attr('id'));
        
        $('#notification-popup').fadeIn();
        return false;
    });
    $(".notifications .activate").on("click", function() {
        //console.log('activate');
        var active=$(this).parent('li').find('input.active').val();
        //console.log('active: '+active);
        var classes=['off', 'on'];
        $(this).parent('li').find('a').removeClass(classes[active]);
        active = (1*active+1)%2;
        
        //console.log('ahora: '+active+classes[active]);
        $(this).parent('li').find('a').addClass(classes[active]);
        $(this).parent('li').find('input.active').val(active);
        saveNotifications();
        return false;
    });
    $("#profile-submit").on("click", function() {
        saveProfile();
        return false;
    });
    $(".workout-for-today").on("click", function() {
        if(curSession==null || curSession=='null'){
            var query = "SELECT workout FROM mysessions ORDER BY id DESC LIMIT 1";
            console.log(query);
            db.transaction(function(tx){
                tx.executeSql(query, [], function(tx, results){
                    console.log('enter');
                    if(results.rows.length > 0){
                        i = 0;
                        if(i < results.rows.length){
                            var lastwk = results.rows.item(i).workout;
                            console.log('A '+lastwk);
                            var cant = Object.keys(workouts).length-1;
                            curWorkout = lastwk%cant;
                            curWorkout = curWorkout+1;
                            newSession(curWorkout);
                        }
                    }else{
                        console.log('first wk');
                        curWorkout = 1;
                        newSession(curWorkout);
                    }

                }, errorCB);
            }, errorCB);
            console.log('exit select wk4today');
        }else{
            console.log(' curWorkout:'+curWorkout+' curTimestamp:'+curTimestamp+' curSession:'+curSession+' curWorkout:'+curWorkout+' curEx:'+curEx);
            loadWorkout();
            $.mobile.changePage( "#workout", { allowSamePageTransition: true, transition: 'slide', reverse: true } );
        }
        
        return false;
    });
    $(".workout-random").on("click", function() {
        var cant = Object.keys(workouts).length-1;
        var rnd = Math.round((Math.random()+1)*1000);
        console.log(rnd+' % '+cant+' = '+rnd%cant);
        curWorkout = Math.round(rnd%cant);
        curWorkout = curWorkout+1;
        newSession(curWorkout);
        return false;
    });
    $("#motivation-quotes a.refresh").on("click", function() {
        rotateSpeed = 25;
	changeQuote();
        return false;
    });
    $(".footer-links a").on("click", function() {
        if($(this).is('.active')){
            hideFooterTabs();
        }else{
            showFooterTab($(this).attr('rel'));
        }
        return false;
    });	
    $(".footer-menu a.leave").on("click", function() {
        endSeasson();
        
        return false;
    });	
    $( "#workout .next" ).off('click').on( "click", function( event, ui ) {
        nextEx();
        videoPlayer.play();
        return false;
    });
    $( "#workout .prev" ).off('click').on( "click", function( event, ui ) {
        prevEx();
        videoPlayer.play();
        return false;
    });
    
    $( "#home" ).on( "pagebeforeshow", function( event, ui ) {
        correctProfileImg();
    });
    $( "#statistics-sesion" ).on( "pagebeforeshow", function( event, ui ) {
    
        var query = "SELECT stats.mysession_id, SUM(`segs`) as wtime FROM stats GROUP BY stats.mysession_id  ORDER BY stats.mysession_id DESC LIMIT 1";
        //mylog(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    console.log(results.rows.item(0));
                    var wtime = results.rows.item(0).wtime;
                    if(wtime<60){
                        $('#statistics-sesion .wtime').html(wtime+'<span class="unit">.segs</span>');
                    }else{
                        if(wtime<3600){
                            $('#statistics-sesion .wtime').html(Math.floor(wtime/60)+':'+Math.floor(wtime%60)+'<span class="unit">.min</span>');
                        }else{
                            $('#statistics-sesion .wtime').html(Math.floor(wtime/3600)+':'+Math.floor((wtime%3600)/60)+':'+Math.floor((wtime%3600)%60)+'<span class="unit">.hours</span>');
                        }
                    }
                }

            }, errorCB);
        }, errorCB);
    });
    $( "#statistics-week" ).on( "pagebeforeshow", function( event, ui ) {
        var d = new Date();
        var from = d.setDate(d.getDate()-d.getDay());
        from = formatDate(from);
        var query = "SELECT SUM(`segs`) as wtime FROM stats WHERE stats.enddate>='"+from+" 00:00:00'";
        console.log(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    console.log(results.rows.item(0));
                    var wtime = results.rows.item(0).wtime;
                    if(wtime<60){
                        $('#statistics-week .wtime').html(wtime+'<span class="unit">.segs</span>');
                    }else{
                        if(wtime<3600){
                            $('#statistics-week .wtime').html(Math.floor(wtime/60)+':'+Math.floor(wtime%60)+'<span class="unit">.min</span>');
                        }else{
                            $('#statistics-week .wtime').html(Math.floor(wtime/3600)+':'+Math.floor((wtime%3600)/60)+':'+Math.floor((wtime%3600)%60)+'<span class="unit">.hours</span>');
                        }
                    }
                }

            }, errorCB);
        }, errorCB);
    });
    
    $( "#statistics-month" ).on( "pagebeforeshow", function( event, ui ) {
        var d = new Date();
        var query = "SELECT SUM(`segs`) as wtime FROM stats WHERE stats.curmonth="+(d.getMonth()+1);
        console.log(query);
        //mylog(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    console.log(results.rows.item(0));
                    var wtime = results.rows.item(0).wtime;
                    if(wtime<60){
                        $('#statistics-month .wtime').html(wtime+'<span class="unit">.segs</span>');
                    }else{
                        if(wtime<3600){
                            $('#statistics-month .wtime').html(Math.floor(wtime/60)+':'+Math.floor(wtime%60)+'<span class="unit">.min</span>');
                        }else{
                            $('#statistics-month .wtime').html(Math.floor(wtime/3600)+':'+Math.floor((wtime%3600)/60)+':'+Math.floor((wtime%3600)%60)+'<span class="unit">.hours</span>');
                        }
                    }
                }

            }, errorCB);
        }, errorCB);
    });
    
    $( "#statistics-total" ).on( "pagebeforeshow", function( event, ui ) {
    
        var query = "SELECT SUM(`segs`) as wtime FROM stats";
        //mylog(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    console.log(results.rows.item(0));
                    var wtime = results.rows.item(0).wtime;
                    if(wtime<60){
                        $('#statistics-total .wtime').html(wtime+'<span class="unit">.segs</span>');
                    }else{
                        if(wtime<3600){
                            $('#statistics-total .wtime').html(Math.floor(wtime/60)+':'+Math.floor(wtime%60)+'<span class="unit">.min</span>');
                        }else{
                            $('#statistics-total .wtime').html(Math.floor(wtime/3600)+':'+Math.floor((wtime%3600)/60)+':'+Math.floor((wtime%3600)%60)+'<span class="unit">.hours</span>');
                        }
                    }
                }

            }, errorCB);
        }, errorCB);
    });
    $( "#motivation-quotes" ).on( "pagebeforeshow", function( event, ui ) {
        changeQuote();
    });
    $( "#workout" ).on( "pagebeforeshow", function( event, ui ) {
        loadWorkout();
        videoPlayer.play();
    });
    $( ".mypage" ).on( "pagebeforeshow", function( event, ui ) { 
        var pag = $.mobile.activePage.attr("id");
       
        if(pag == 'home'){
            showFooterTab('workout');
        }else if(pag == 'congratulations'){
            inWorkout = false;
            showFooterTab('statistics');
        }else{
            hideFooterTabs();
        }

        if(inWorkout){
            $('.strech, .leave').show();
            $('.workout-for-today, .workout-random').hide();
        }else{
            $('.workout-for-today, .workout-random').show();
            $('.strech, .leave').hide();
        }
    });
    $("#wvideo").bind('ended', function(){
        if($.mobile.activePage.attr("id") == "workout"){
            videoPlayer.play();
        }
    });
}
function rotateRefresh(){
    var rays = $("#motivation-quotes a.refresh");
    setInterval(function() {
            rotateDegrees += rotateSpeed; // degree adjustment each interval
            rays.css("transform", "rotate(" + rotateDegrees + "deg)");
            if(rotateDegrees > 360){
                rotateDegrees = 0;
                rotateSpeed = 0;
            }
    },20);
}
function newSession(wk){
    console.log('newSession('+wk+')');
        query = 'INSERT INTO mysessions(`workout`, `current_exercise`) VALUES ('+wk+', 0)';
        curWorkout = wk;
        curEx = 0;

        window.localStorage.setItem("curWorkout", wk);
        window.localStorage.setItem("curEx", 0);
    
        //dbController.get_last_insert_id();
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                last_insert_id=results.insertId;
                curSession = last_insert_id;
                window.localStorage.setItem("curSession", curSession);
                console.log("Insert: "+last_insert_id+" Session: "+curSession+' Timestamp: '+ Date.now());
                
            }, errorCB);
        }, errorCB);
    
    
    loadWorkout();
    $.mobile.changePage( "#workout", { allowSamePageTransition: true, transition: 'slide', reverse: true } );
    
}
function prevEx(){
    if(curEx > 0){
        saveWorkout(curWorkout, curTimestamp, curSession, curWorkout, curEx);
        curEx = curEx-1;
        window.localStorage.setItem("curEx", curEx);
        loadWorkout();
        $.mobile.changePage( "#workout", { allowSamePageTransition: true, transition: 'slide', reverse: true } );
    }else{
        //curWorkout = 0;
        curEx = 0;
        //window.localStorage.setItem("curWorkout", curWorkout);
        window.localStorage.setItem("curEx", curEx);
    }
}
function nextEx(){
    console.log('entra');
    saveWorkout(curWorkout, curTimestamp, curSession, curWorkout, curEx);
    curEx = curEx+1;
    if(curEx < Object.keys(workouts[curWorkout].exercices).length){
        console.log('si');
        window.localStorage.setItem("curEx", curEx);
        loadWorkout();
        $.mobile.changePage( "#workout", { allowSamePageTransition: true, transition: 'slide' } );
    }else{
        endSeasson();
    }
}
function endSeasson(){
    console.log('no');
    curSession = null;
    curWorkout = 0;
    curEx = 0;
    window.localStorage.setItem("curSession", curSession);
    window.localStorage.setItem("curWorkout", curWorkout);
    window.localStorage.setItem("curEx", curEx);
    $.mobile.changePage( "#congratulations", { transition: 'slide', reverse: true } );
}
function loadSession(){
    curSession = window.localStorage.getItem("curSession");
    curWorkout = window.localStorage.getItem("curWorkout");
    curEx = window.localStorage.getItem("curEx");
    profile_img = window.localStorage.getItem("profile_img");
    if(profile_img == '' || profile_img == 'null'){
        profile_img = 'images/profile/default.jpg';
        correctProfileImg();
    }else{
        cameraSuccess(profile_img);
    }
}

function loadWorkout(){
    inWorkout = true;
    //console.log(workouts[curWorkout].exercices[curEx]);
    $('#sets').html('Sets: '+workouts[curWorkout].exercices[curEx].sets[0]);
    $('#repss').html(workouts[curWorkout].exercices[curEx].reps[0]);
    $('.explanation').html(workouts[curWorkout].exercices[curEx].desc);
    $('.explanation').prepend('<h2>'+workouts[curWorkout].exercices[curEx].title+'</h2>');
    //videoPlayer.src = basepath_ + workouts[curWorkout].exercices[curEx].video;
    
    var fileTransfer = new FileTransfer();
    var uri = cordova.file.applicationDirectory+'www/'+workouts[curWorkout].exercices[curEx].video;
    fileTransfer.download(
        uri,
        cordova.file.dataDirectory+workouts[curWorkout].exercices[curEx].video,
        function(entry) {
            console.log("download complete: " + entry.fullPath);
            videoPlayer.src=cordova.file.dataDirectory+entry.fullPath;
            console.log("videoPlayer.src: " + videoPlayer.src);
        },
        function(error) {
            alert("download error source " + error.source + " (code: "+error.code+")");
        }
    );
    
    //window.plugins.html5Video.initialize({
    //    "wvideo" : workouts[curWorkout].exercices[curEx].video
    //});
    //alert(videoPlayer.src);
    hideFooterTabs();
    if(curWorkout>0){
        curTimestamp = Date.now();
    }else{
        curTimestamp = 0;
    }
    return true;
}
function saveWorkout(cWorkout, cTimestamp, cSession, cWorkout, cEx){
    if(cWorkout>0 && cTimestamp>0){
        var segs = Math.round((Date.now()-cTimestamp)/1000);
        if(segs > maxSegs){
           segs = maxSegs; 
        }
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        console.log('Segs: '+segs);
        cTimestamp = Date.now();
        console.log('UPDATE mysessions SET `current_exercise`='+cEx+' WHERE id='+cSession);
        dbController.dbquery('UPDATE mysessions SET `current_exercise`='+curEx+' WHERE id='+curSession);
        console.log('INSERT INTO stats (`mysession_id`, `enddate`, `curmonth`, `segs`, `workout`, `exercise`) VALUES('+cSession+', "'+getCurDate()+'", '+month+', '+segs+', '+cWorkout+', '+cEx+')');
        dbController.dbquery('INSERT INTO stats (`mysession_id`, `enddate`, `curmonth`, `segs`, `workout`, `exercise`) VALUES('+cSession+', "'+getCurDate()+'", '+month+', '+segs+', '+cWorkout+', '+cEx+')');
    }
}
//Mostrar Tab del footer
function showFooterTab(section) {
    $('.footer-links a').removeClass('active')
    $('.footer-links a.'+section).addClass('active');
    $('.footer-menu div').removeClass('active')
    $('.footer-menu div.'+section).addClass('active');
}
//Ocultar Tabs del footer
function hideFooterTabs() {
    $('.footer-links a').removeClass('active')
    $('.footer-menu div').removeClass('active')
}
function loadTips(){
    console.log('loadTips');
    $.get(
        'includes/tips.html', function(data) {
            $('#tips .ui-content').html(data);
        },
        'html'
    );
    
    return true;
}

function loadQuotes(){
    console.log('loadQuotes');
    $.get(
        'includes/quotes.html', function(data) {
            $('#motivation-quotes .ui-content .quotes').html(data);
            quotesCant = $('#motivation-quotes .ui-content .quotes p').last().attr('id').split('quote-')[1]*1;
            changeQuote();
        },
        'html'
    );
    
    return true
}
function changeQuote(){
    //$('#motivation-quotes .ui-content .quotes p').removeClass('active');
    $('#motivation-quotes .ui-content .quotes p').hide();
    row = Math.floor(Math.random() * quotesCant) + 1;
    //$('#motivation-quotes .ui-content .quotes p#quote-'+row).animate('active');
    $('#motivation-quotes .ui-content .quotes p#quote-'+row).fadeIn('slow');

}
function loadProfile(){
    var value = window.localStorage.getItem("profile");
    profile = JSON.parse(value);
    if(is_empty(profile)){
        $.mobile.changePage( "#profile", {transition: "none"});
    }else{
        $('#profile-name').val(profile.name);
        $('#profile-age').val(profile.age);
        $('#profile-level').val(profile.level);
        if(profile.name != ''){
            $('.profile-name').html(profile.name);   
        }else{
            $('.profile-name').html('Workout');   
        }
        if(profile.level != ''){
            $('.profile-level').html('Level '+profile.level);   
        }else{
            $('.profile-level').html('Level 1');   
        }
        showFooterTab('workout');
    }
}
function saveProfile(){
    console.log('saveProfile');
    profile = {
        name: $('#profile-name').val(),
        age: $('#profile-age').val(),
        level: $('#profile-level').val()
    };
    
    if(profile.name != ''){
        $('.profile-name').html(profile.name);   
    }else{
        $('.profile-name').html('Workout');   
    }
    if(profile.level != ''){
        $('.profile-level').html('Level '+profile.level);   
    }else{
        $('.profile-level').html('Level 1');   
    }
    window.localStorage.setItem("profile", JSON.stringify(profile));
    $.mobile.changePage( "#home", {transition: "none"});
}
function loadNotifications(){
    var classes=['off', 'on'];
    var value = window.localStorage.getItem("notifications");
    if(value!=null){
        notifications = JSON.parse(value);

        $('#notification-monday-time').val(notifications.monday.time);
        $('#notification-monday-on').val(notifications.monday.on);
        $('#notification-monday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.monday.on]);
        $('#notification-monday-on').parent().find('.set-time .time').text(notifications.monday.time+'hs');

        $('#notification-tuesday-time').val(notifications.tuesday.time);
        $('#notification-tuesday-on').val(notifications.tuesday.on); 
        $('#notification-tuesday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.tuesday.on]);
        $('#notification-tuesday-on').parent().find('.set-time .time').text(notifications.tuesday.time+'hs');

        $('#notification-wednesday-time').val(notifications.wednesday.time);
        $('#notification-wednesday-on').val(notifications.wednesday.on); 
        $('#notification-wednesday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.wednesday.on]);
        $('#notification-wednesday-on').parent().find('.set-time .time').text(notifications.wednesday.time+'hs');

        $('#notification-thursday-time').val(notifications.thursday.time);
        $('#notification-thursday-on').val(notifications.thursday.on); 
        $('#notification-thursday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.thursday.on]);
        $('#notification-thursday-on').parent().find('.set-time .time').text(notifications.thursday.time+'hs');

        $('#notification-friday-time').val(notifications.friday.time);
        $('#notification-friday-on').val(notifications.friday.on); 
        $('#notification-friday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.friday.on]);
        $('#notification-friday-on').parent().find('.set-time .time').text(notifications.friday.time+'hs');

        $('#notification-saturday-time').val(notifications.saturday.time);
        $('#notification-saturday-on').val(notifications.saturday.on); 
        $('#notification-saturday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.saturday.on]);
        $('#notification-saturday-on').parent().find('.set-time .time').text(notifications.saturday.time+'hs');

        $('#notification-sunday-time').val(notifications.sunday.time);
        $('#notification-sunday-on').val(notifications.sunday.on); 
        $('#notification-sunday-on').parent().find('a').removeClass('on').removeClass('off').addClass(classes[notifications.sunday.on]);
        $('#notification-sunday-on').parent().find('.set-time .time').text(notifications.sunday.time+'hs');
    }
}
function saveNotifications(){
    notifications= {
        monday: { time: $('#notification-monday-time').val(), on: $('#notification-monday-on').val()}, 
        tuesday: { time: $('#notification-tuesday-time').val(), on: $('#notification-tuesday-on').val()}, 
        wednesday: { time: $('#notification-wednesday-time').val(), on: $('#notification-wednesday-on').val()}, 
        thursday: { time: $('#notification-thursday-time').val(), on: $('#notification-thursday-on').val()}, 
        friday: { time: $('#notification-friday-time').val(), on: $('#notification-friday-on').val()}, 
        saturday: { time: $('#notification-saturday-time').val(), on: $('#notification-saturday-on').val()}, 
        sunday: { time: $('#notification-sunday-time').val(), on: $('#notification-sunday-on').val()}
    }
    window.localStorage.setItem("notifications", JSON.stringify(notifications));
    setUpNotifications();
}
function setUpNotifications(){
    var now = new Date(),
        wday= now.getDay();
    var hs = now.getHours();
    if(hs<10){
        hs = '0'+hs;
    }
    var mn = now.getMinutes();
    if(mn<10){
        mn = '0'+mn;
    }
    var hora = hs+':'+mn;
    window.plugin.notification.local.cancelAll();

    setUpNotification(now, hora, wday, 0, notifications.sunday);
    setUpNotification(now, hora, wday, 1, notifications.monday);
    setUpNotification(now, hora, wday, 2, notifications.tuesday);
    setUpNotification(now, hora, wday, 3, notifications.wednesday);
    setUpNotification(now, hora, wday, 4, notifications.thursday);
    setUpNotification(now, hora, wday, 5, notifications.friday);
    setUpNotification(now, hora, wday, 6, notifications.saturday);
}
function setUpNotification(now, hora, wday, tday, savedNotification){
    var _alarm = null;
    if(savedNotification.on == '1'){
        var tsplit = savedNotification.time.split(':');
        if(wday == tday){
            if(hora>savedNotification.time){
                //setear en 7 dias
                _alarm = new Date();
                _alarm.setDate(_alarm.getDate()+7);
                _alarm.setHours(tsplit[0]);
                _alarm.setMinutes(tsplit[1]);
                _alarm.setSeconds(0);
            }else{
                //setear hoy
                _alarm = new Date();
                _alarm.setHours(tsplit[0]);
                _alarm.setMinutes(tsplit[1]);
                _alarm.setSeconds(0);
            }
        }else if(wday > tday){
            _alarm = new Date();
            _alarm.setDate(_alarm.getDate()+tday - wday +7);
            _alarm.setHours(tsplit[0]);
            _alarm.setMinutes(tsplit[1]);
            _alarm.setSeconds(0);
        }else{
            _alarm = new Date();
            _alarm.setDate(_alarm.getDate()+tday - wday);
            _alarm.setHours(tsplit[0]);
            _alarm.setMinutes(tsplit[1]);
            _alarm.setSeconds(0);
        }
        var row = Math.floor(Math.random() * quotesCant) + 1;
        //alert('setted: '+tday+' > '+_alarm.toLocaleString()+' > '+$('#motivation-quotes .ui-content .quotes p#quote-'+row).text())
        window.plugin.notification.local.add({
            id:      tday,
            title:   'Workout',
            message: $('#motivation-quotes .ui-content .quotes p#quote-'+row).text(),
            repeat:  'weekly',
            date:    _alarm
        });
    }
}
function closeNotificationPopup(){
    $('#notification-popup-time').val('');
    $('#notification-caller').val('');
    $('#notification-popup').fadeOut();
}
function saveNotificationTime(){
    var valor = $('#notification-popup-time').val();
    var $caller= $('#'+$('#notification-caller').val());
    $caller.val(valor);
    $caller.parent().find('.set-time .time').text(valor+'hs');
    $('#notification-popup').fadeOut();
    saveNotifications();
}

function loadExercise(exercise){
    console.log('loadExercise('+exercise+')');/*
    if($xmlWorkout.lenght > 0){
        $xmlWorkout.find('ejercicio[row="'+exercise+'"]').each(function(){
            if($(this).find("titulo").length > 0){
                ejercicios += $(this).find("titulo").text() + " ";
            }
        });
    }*/
    return false;
}
//si un objeto está vacío
function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }

    return true;
}

/* Abrir Popup */
function openPopup(msg){
    if(popup_opened===false){
        popup_opened=true;
        $('#popup-message').html(msg);
        $('#popup').fadeIn();
    }
}
function closePopup(){
    $('#popup-message').html('');
    $('#popup').fadeOut();
    
    setTimeout(function(){
        popup_opened=false;
    }, 1000);
}
function getCurDate(){
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    if(month<10){
        month = '0'+month;
    }
    var day = currentDate.getDate();
    if(day<10){
        day = '0'+day;
    }
    var hs = currentDate.getHours();
    if(hs<10){
        hs = '0'+hs;
    }
    var mn = currentDate.getMinutes();
    if(mn<10){
        mn = '0'+mn;
    }
    var sc = currentDate.getSeconds();
    if(sc<10){
        sc = '0'+sc;
    }
    return year+'-'+month+'-'+day+' '+hs + ":" + mn + ":" + sc;
}
function formatDate(date){
    var currentDate = new Date(date);
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    if(month<10){
        month = '0'+month;
    }
    var day = currentDate.getDate();
    if(day<10){
        day = '0'+day;
    }
    return year+'-'+month+'-'+day;
}
/*get photos*/
function imageProfile(){
    //app.galleryPhoto('profile-photo');
    navigator.camera.getPicture( cameraSuccess, cameraError, {
            quality: 50,
            correctOrientation:true,
            targetWidth: 768,
            targetHeight: 768,
            allowEdit: true,
            saveToPhotoAlbum: true,
            cameraDirection: Camera.Direction.BACK,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            destinationType: Camera.DestinationType.NATIVE_URI
        });
}
function photoProfile(){
    //app.capturePhoto('profile-photo');
    navigator.camera.getPicture( cameraSuccess, cameraError, {
            quality: 50,
            correctOrientation:true,
            targetWidth: 768,
            targetHeight: 768,
            allowEdit: true,
            saveToPhotoAlbum: true,
            cameraDirection: Camera.Direction.BACK,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA ,
            destinationType: Camera.DestinationType.NATIVE_URI
        });
}
function cameraSuccess(imageURI) {
    window.localStorage.setItem("profile_img", imageURI);
    var image = document.getElementById('profile-photo');
    image.src = imageURI;
    
    if(image.width>image.height){
        $('#profile-photo').removeClass('vertical');
    }else{
        $('#profile-photo').addClass('vertical');
    }
}

function cameraError(message) {
    alert('Failed because: ' + message);
}
function correctProfileImg(){
    var image = document.getElementById('profile-photo');
    if(image.width>image.height){
        $('#profile-photo').removeClass('vertical');
    }else{
        $('#profile-photo').addClass('vertical');
    }
}