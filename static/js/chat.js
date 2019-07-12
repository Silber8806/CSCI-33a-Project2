document.addEventListener('DOMContentLoaded', (event) => {

    const enter_key = 13;
    var add_channels_btn = document.querySelector('#add_channel');
    var define_channels_btn = document.querySelector('#define_channel');
    var channel_list = document.querySelector('#channel_listing')
    var channel_prototype = document.querySelector('#channel_prototype')
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    function add_channel(name) {
        new_channel = channel_prototype.cloneNode(true);
        new_channel.innerHTML = new_channel.innerHTML + name;
        channel_list.append(new_channel);
        new_channel.style.display = 'block';
        return
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
                if (! /\s/.test(channel_name) && channel_name.length !== 0) {
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

        set_up_channel_ui()
    });
});