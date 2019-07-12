document.addEventListener('DOMContentLoaded', (event) => {

    const enter_key = 13;
    var add_channels_btn = document.querySelector('#add_channel');
    var define_channels_btn = document.querySelector('#define_channel');
    var channel_list = document.querySelector('#channel_listing')
    var channel_prototype = document.querySelector('#channel_prototype')
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    add_channels_btn.onclick = function() {
        add_channels_btn.style.display = 'none';
        define_channels_btn.value = '';
        define_channels_btn.style.display = 'inline';
        define_channels_btn.focus();
    }

    define_channels_btn.onkeypress = function(event) {

        if (event.keyCode === enter_key) {
            let current_value =  this.value;
            if (! /\s/.test(current_value)) {
                add_channels_btn.style.display = 'inline';
                define_channels_btn.style.display = 'none';
                new_channel = channel_prototype.cloneNode(true);
                new_channel.innerHTML = new_channel.innerHTML + this.value;
                channel_list.append(new_channel);
                new_channel.style.display = 'block';
            }
            event.preventDefault();
        }
    }

    define_channels_btn.onblur = function(event) {
        add_channels_btn.style.display = 'inline';
        define_channels_btn.style.display = 'none';
    }

    define_channel_btn.onsubmit = function(event) {
        event.preventDefault();
    }
});