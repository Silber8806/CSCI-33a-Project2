document.addEventListener('DOMContentLoaded', (event) => {

    function validate_name_has_no_spaces(name) {
        return ( ! /\s/.test(name) && name.length !== 0 )
    }

    function sign_up_user() {
        if (localStorage.getItem("username") === null) {
            document.querySelector("#modal_login_avatar_btn").onclick = function(){
                let new_username = document.querySelector("#modal_login_avatar_name").value;
                console.log(new_username);
                if (validate_name_has_no_spaces(new_username)) {
                    localStorage.setItem('username',new_username);
                    $('#modal_login_avatar').modal('hide');
                }
            };
            $("#modal_login_avatar").modal({backdrop: 'static'});
        }

        let username = localStorage.getItem("username");
        document.getElementById("current_logged_in_user").innerHTML = username;
        return 0
    }

    function set_up_channel_ui() {
        socket.on('announce channel', data => {
            let channel_name = data.name;
            add_channel(channel_name);
        });

        add_channels_btn.onclick = function() {
            add_channels_btn.style.display = 'none';
            define_channels_btn.value = '';
            define_channels_btn.style.display = 'inline';
            define_channels_btn.focus();
        }

        define_channels_btn.onkeypress = function(event) {
            if (event.keyCode === enter_key) {
                let channel_name =  this.value;
                if (validate_name_has_no_spaces(channel_name)) {
                    add_channels_btn.style.display = 'inline';
                    define_channels_btn.style.display = 'none';
                    add_channel(channel_name);
                    socket.emit('submit channel', {'name': channel_name})
                }
                event.preventDefault();
            }
        }

        define_channels_btn.onblur = function(event) {
            add_channels_btn.style.display = 'inline';
            define_channels_btn.style.display = 'none';
        }

        define_channels_btn.onsubmit = function(event) {
            event.preventDefault();
        }
    }

    function add_channel(name) {
        new_channel = channel_prototype.cloneNode(true);
        new_channel.innerHTML = new_channel.innerHTML + name;
        channel_list.append(new_channel);
        new_channel.style.display = 'block';
        return 0
    }

    const enter_key = 13;
    var add_channels_btn = document.querySelector('#add_channel');
    var define_channels_btn = document.querySelector('#define_channel');
    var channel_list = document.querySelector('#channel_listing')
    var channel_prototype = document.querySelector('#channel_prototype')
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let data = JSON.parse(this.responseText);
                data.forEach(function(channel) {
                    add_channel(channel);
                });
            }
        };
        xhttp.open("GET", "/channels", true);
        xhttp.send();

        sign_up_user();
        set_up_channel_ui();
    });
});