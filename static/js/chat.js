document.addEventListener('DOMContentLoaded', (event) => {

    function validate_name_has_no_spaces(name) {
        return ( /^[a-zA-Z0-9-_]+$/.test(name) && name.length !== 0 )
    }

    function message_board_scroll_bottom() {
        let current_message_board = document.getElementById("chatroom");
        window.scrollTo(0,current_message_board.scrollHeight);
        return 0;
    }

    function create_adorable_io_avatar(name){
        let avatar_url='https://api.adorable.io/avatars/640/' + name + '@hipster.png'
        return avatar_url
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

                    let listed_channels = document.getElementsByClassName('channel')
                    let message_board = document.getElementById("message_board");

                    while (message_board.childNodes.length > 1){
                        message_board.removeChild(message_board.lastChild);
                    }

                    channel_update_data={'name': current_active_channel}
                    socket.emit('get channel messages', channel_update_data)

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

    function add_message(username, time, content){
        new_message = message_prototype.cloneNode(true);
        new_message.removeAttribute("id");
        new_message.querySelector('.message_content').innerHTML = content;
        new_message.querySelector('.message_username').innerHTML = username;
        new_message.querySelector('.message_time').innerHTML = time;
        new_message.querySelector('.message_avatar').src = create_adorable_io_avatar(username);
        message_board.append(new_message);
        new_message.style.display = 'inline';
        last_message_username=username;
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
            let channel_name = data.name;
            add_channel(channel_name);
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
                console.log(document.documentElement.scrollHeight)
                console.log(current_message_board.scrollHeight)
                if (document.documentElement.scrollHeight === current_message_board.scrollHeight) {
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
                console.log(document.title);
                if (document.title.charAt(0) !== "*") {
                    document.title = "*" + document.title
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
                let date_options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit',minute: '2-digit', second: '2-digit'};
                let current_date = new Date().toLocaleString("en-US",date_options);
                add_message(current_active_user,current_date,current_message);
                send_message(current_active_user, current_date, current_message);
                message_board_scroll_bottom();
                return 0
            }
        }
    }

    function send_message(username, time, content) {
        let message_data = {'username': username,'time': time,'content':content, 'room':current_active_channel};
        socket.emit('submit message', message_data)
        return 0
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