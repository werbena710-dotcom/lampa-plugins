(function () {
    'use strict';

    if (window.plugin_radio_ready) return;
    window.plugin_radio_ready = true;

    // Список станций — правьте под себя
    var stations = [
        { name: 'Europa Plus',   url: 'https://ep256.hostingradio.ru:8052/europaplus256.mp3' },
        { name: 'Retro FM',      url: 'https://retroserver.streamr.ru:8043/retro256.mp3' },
        { name: 'Радио Record',  url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
        { name: 'Наше Радио',    url: 'https://nashe1.hostingradio.ru/nashe-128.mp3' },
        { name: 'Дорожное радио',url: 'https://dorognoe.hostingradio.ru:8000/radio' },
        { name: 'Шансон',        url: 'https://chanson.hostingradio.ru:8041/chanson256.mp3' },
        { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' }
    ];

    var audio = new Audio();
    var current = null;

    function RadioComponent(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div></div>');
        var last;
        var self = this;

        function play(st, item) {
            if (current === st.url && !audio.paused) {
                audio.pause();
                item.find('.radio-state').text('');
                return;
            }
            html.find('.radio-state').text('');
            current = st.url;
            audio.src = st.url;
            audio.play().then(function () {
                item.find('.radio-state').text('▶');
            }).catch(function () {
                Lampa.Noty.show('Не удалось воспроизвести: ' + st.name);
            });
        }

        this.create = function () {
            stations.forEach(function (st) {
                var item = $(
                    '<div class="selector" style="display:flex;justify-content:space-between;' +
                    'padding:1em 1.5em;margin:.4em 1.5em;background:rgba(255,255,255,.08);' +
                    'border-radius:.5em;font-size:1.4em">' +
                    '<span>' + st.name + '</span><span class="radio-state"></span></div>'
                );
                if (current === st.url && !audio.paused) item.find('.radio-state').text('▶');

                item.on('hover:focus', function (e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });
                item.on('hover:enter', function () {
                    play(st, item);
                });
                scroll.append(item);
            });

            html.append(scroll.render());
            self.activity.loader(false);
            self.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add('radio_plugin', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                left: function () {
                    Lampa.Controller.toggle('menu');
                },
                right: function () {},
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('radio_plugin');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            scroll.destroy();
            html.remove();
        };
    }

    function addMenu() {
        var btn = $(
            '<li class="menu__item selector">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
            '<path d="M3.2 7.5 20 2l.7 1.9L10 7.5H20a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 1.2-2zM8 11.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>' +
            '</svg></div><div class="menu__text">Радио</div></li>'
        );
        btn.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Радио',
                component: 'radio_plugin',
                page: 1
            });
        });
        $('.menu .menu__list').eq(0).append(btn);
    }

    Lampa.Component.add('radio_plugin', RadioComponent);

    if (window.appready) addMenu();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addMenu();
        });
    }
})();
