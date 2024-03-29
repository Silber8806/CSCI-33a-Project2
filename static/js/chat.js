document.addEventListener('DOMContentLoaded', (event) => {

    function get_unix_time(){
        return (new Date).getTime()/1000;
    }

    function format_unix_time(unix_time) {
        let unformatted_date = new Date( unix_time * 1000 );
        let date_options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit',minute: '2-digit', second: '2-digit'};
        let formatted_date = new Date().toLocaleString("en-US",date_options);
        return formatted_date;
    }

    function validate_name_has_no_spaces(name) {
        return ( /^[a-zA-Z0-9-_]+$/.test(name) && name.length !== 0 )
    }

    function message_board_scroll_bottom() {
        window.scrollTo(0,document.getElementById("chatroom").scrollHeight);
        return 0;
    }

    function create_message_id(username, time) {
        return  username + '_' + time;
    }

    function create_adorable_io_avatar(name){
        return 'https://api.adorable.io/avatars/640/' + name + '@hipster.png'
    }

    function add_channel(name) {
        if (! current_channels.includes(name)) {
            current_channels.push(name);

            new_channel = channel_prototype.cloneNode(true);
            new_channel.innerHTML = new_channel.innerHTML + name;
            new_channel.id = "channel-" + name;
            channel_list.append(new_channel);
            new_channel.style.display = 'block';

            socket.emit('submit channel', {'name': name})

            new_channel.onclick = function() {
                    //closure :D
                if (name != current_active_channel) {

                    former_channel=document.getElementById('channel-'+current_active_channel);
                    former_channel.style.background = '#3F0E40';
                    former_channel.style.color = '#b29fb3'

                    current_active_channel = name;
                    document.getElementById('current_active_channel_name').innerHTML = current_active_channel;

                    let listed_channels = document.getElementsByClassName('channel');

                    while (message_board.childNodes.length > 1){
                        message_board.removeChild(message_board.lastChild);
                    }

                    socket.emit('get channel messages', {'name': current_active_channel})

                    unchecked_channels.delete(current_active_channel);

                    if (unchecked_channels.size == 0) {
                        document.title = document.title.replace("*","");
                    }

                    this.style.background = '#1164A3';
                    this.style.color = "#FFFFFF";
                    this.style.fontWeight = 400;
                }
            }
        }
        return 0
    }

    function send_message(username, time, content) {
        socket.emit('submit message', {'username': username,'time': time,'content':content, 'room':current_active_channel})
        return 0
    }

    function remove_post_with_animation(post){
        if(post.classList.contains('hide')) {
            let post_content = Array.prototype.slice.apply(post.querySelectorAll("*"));

            post_content.forEach((post_element) => {
                post_element.style.animationPlayState = 'running';
            });

            post.style.animationPlayState = 'running';
            post.addEventListener('animationend', () =>  {
                post.remove();
            });

        } else {
            post.remove();
        }
        return 0
    }

    function add_message(username, time, content){
        new_message = message_prototype.cloneNode(true);
        new_message.removeAttribute("id");
        new_message.id = create_message_id(username,time);
        new_message.querySelector('.message_content').innerHTML = content;
        new_message.querySelector('.message_username').innerHTML = username;
        new_message.querySelector('.message_time').innerHTML = format_unix_time(time);
        new_message.querySelector('.message_avatar').src = create_adorable_io_avatar(username);
        message_board.append(new_message);
        new_message.style.display = 'inline';
        last_message_username=username;

        let new_message_remove_button = new_message.querySelector('.message_delete');
        if (username === current_active_user){
            new_message_remove_button.onclick = function(event){
                let message_post = this.parentNode.parentNode;
                remove_post_with_animation(message_post);
                socket.emit('delete message', {'username': username,'time': time, 'room': current_active_channel})
            }
        } else {
            new_message_remove_button.remove();
        }

        return 0
    }

    function get_all_channels()
    {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let data = JSON.parse(this.responseText);
                data.sort(function(a,b){
                    if(a === "help"){
                        return -1;
                    } else if (b === "help") {
                        return 1;
                    } else {
                        return a.toLowerCase().localeCompare(b.toLowerCase())
                    }
                });
                data.forEach(function(channel) {
                    add_channel(channel);
                    if(channel === "help") {
                        help_channel_data={'name': "help"}
                        socket.emit('get channel messages', help_channel_data)
                        help_channel = document.querySelector('#channel-help')
                        help_channel.style.background = '#1164A3';
                        help_channel.style.color = "#FFFFFF";
                        help_channel.style.fontWeight = 400;
                    }
                });
            }
        };
        xhttp.open("GET", "/channels", true);
        xhttp.send();
    }

    function sign_up_user() {
        if (localStorage.getItem("username") === null) {

            document.querySelector("#modal_login_avatar_name").onkeypress = function(event){
                let keypress = String.fromCharCode(event.keyCode);
                if (/^[a-zA-Z0-9-_]+$/.test(keypress)) {
                    return true;
                }
                event.preventDefault();
                return false;
            };

            document.querySelector("#modal_login_avatar_btn").onclick = function(){
                let new_username = document.querySelector("#modal_login_avatar_name").value;
                if (validate_name_has_no_spaces(new_username)) {
                    localStorage.setItem('username',new_username);
                    $('#modal_login_avatar').modal('hide');
                    set_active_user();
                }
            };
            $("#modal_login_avatar").modal({backdrop: 'static'});
        }
        return 0
    }

    function set_active_user() {
        let username = localStorage.getItem("username");
        document.getElementById("current_logged_in_user").innerHTML = username;
        current_active_user = username
        return 0
    }

    function set_up_socket_listeners() {
        socket.on('announce channel', data => {
            add_channel(data.name);
        });

        socket.on('announce channel updates', data => {
            data.forEach(function(message){
                add_message(message.username,message.time,message.content)
            });
            message_board_scroll_bottom();
        });

        socket.on('announce message', data => {
            if ( data.room === current_active_channel){
                let current_message_board = document.getElementById("message_board");
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                    add_message(data.username, data.time, data.content);
                    message_board_scroll_bottom();
                } else {
                    add_message(data.username, data.time, data.content);
                }
            } else {
                new_message_received_channel = document.getElementById('channel-' + data.room)
                new_message_received_channel.style.color = "#FFFFFF";
                new_message_received_channel.style.fontWeight = 700;
                unchecked_channels.add(data.room);
                if (document.title.charAt(0) !== "*") {
                    document.title = "*" + document.title
                }
            }
        });

         socket.on('announce delete message', data => {
            if ( data.username !== current_active_user) {
                let other_message = document.getElementById(data.username + '_' + data.time);
                if (other_message !== null) {
                    remove_post_with_animation(other_message);
                }
            }
        });
    }

    function set_up_channel_ui() {
        add_channels_btn.onclick = function() {
            add_channels_btn.style.display = 'none';
            define_channels_btn.value = '';
            define_channels_btn.style.display = 'inline';
            define_channels_btn.focus();
        }

        define_channels_btn.onkeypress = function(event) {
            let keypress = String.fromCharCode(event.keyCode);
            if (event.keyCode === enter_key) {
                let channel_name =  this.value;
                if (validate_name_has_no_spaces(channel_name)) {
                    add_channels_btn.style.display = 'inline';
                    define_channels_btn.style.display = 'none';
                    add_channel(channel_name);
                }
                event.preventDefault();
            } else if (/^[a-zA-Z0-9-_]+$/.test(keypress)) {
                return true;
            }

            event.preventDefault();
            return false;
        }

        define_channels_btn.onblur = function(event) {
            add_channels_btn.style.display = 'inline';
            define_channels_btn.style.display = 'none';
        }

        define_channels_btn.onsubmit = function(event) {
            event.preventDefault();
        }
    }

    function set_up_message_box () {
        message_box.onkeypress = function(event) {
         if (event.keyCode === enter_key) {
                let current_message =  this.value;
                let current_message_copy = (' ' + current_message).slice(1);

                if (current_message_copy.trim().length === 0) {
                    return 1
                }
                this.value = '';
                event.preventDefault();
                let current_date = get_unix_time();
                add_message(current_active_user,current_date,current_message);
                send_message(current_active_user, current_date, current_message);
                message_board_scroll_bottom();
                return 0
            }
        }
    }

    const enter_key = 13;
    var current_active_user = 'None';
    var last_message_username = 'None';
    var current_active_channel = 'help';
    var unchecked_channels = new Set();
    var current_channels = [];

    var add_channels_btn = document.querySelector('#add_channel');
    var define_channels_btn = document.querySelector('#define_channel');
    var channel_list = document.querySelector('#channel_listing');
    var message_box = document.querySelector('#hipster_chat_message');
    var message_board = document.querySelector('#message_board');
    var channel_prototype = document.querySelector('#channel_prototype');
    var message_prototype = document.querySelector('#message_prototype');
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        set_up_socket_listeners();
        get_all_channels();
        sign_up_user();
        set_active_user();
        set_up_channel_ui();
        set_up_message_box();
    });
});