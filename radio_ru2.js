(function () {
    'use strict';

    if (window.plugin_radio_ru_ready) return;
    window.plugin_radio_ru_ready = true;

    // Список станций — правьте под себя
    var stations = [
        { name: 'Авторадио', url: 'https://pub0301.101.ru:8443/stream/air/mp3/256/100' },
        { name: 'Дорожное радио', url: 'https://dorognoe.hostingradio.ru:8000/radio' },
        { name: 'Европа Плюс', url: 'https://ep256.hostingradio.ru:8052/europaplus256.mp3' },
        { name: 'Русское Радио', url: 'https://rusradio.hostingradio.ru/rusradio96.aacp' },
        { name: 'Ретро FM', url: 'https://retroserver.streamr.ru:8043/retro256.mp3' },
        { name: 'Вести FM', url: 'https://icecast.vgtrk.cdnvideo.ru/vestifm_mp3_192kbps' },
        { name: 'Радио Дача', url: ['http://217.19.211.252:8022/RadioDacha', 'https://dacha.hostingradio.ru/dacha128.mp3'] },
        { name: 'Радио Шансон', url: 'https://chanson.hostingradio.ru:8041/chanson256.mp3' },
        { name: 'Радио Маяк', url: ['https://icecast-vgtrk.cdnvideo.ru/mayakfm_aac_64kbps', 'https://icecast.vgtrk.cdnvideo.ru/mayakfm_mp3_128kbps', 'https://icecast.vgtrk.cdnvideo.ru/mayak_mp3_128kbps', 'https://icecast.vgtrk.cdnvideo.ru/mayak_mp3_192kbps'] },
        { name: 'Радио Монте-Карло', url: 'https://montecarlo.hostingradio.ru/montecarlo96.aacp' },
        { name: 'Радио России', url: ['https://icecast-vgtrk.cdnvideo.ru/rr_aac_64kbps', 'https://icecast.vgtrk.cdnvideo.ru/rr_mp3_128kbps', 'https://icecast.vgtrk.cdnvideo.ru/rr_mp3_192kbps', 'https://icecast.vgtrk.cdnvideo.ru/rrzonam_mp3_128kbps'] },
        { name: 'Хит FM', url: 'https://hitfm.hostingradio.ru/hitfm96.aacp' },
        { name: 'Наше Радио', url: 'https://nashe1.hostingradio.ru/nashe-128.mp3' },
        { name: 'DFM', url: 'https://dfm.hostingradio.ru/dfm96.aacp' },
        { name: 'Радио 7 на семи холмах', url: 'https://radio7.hostingradio.ru:8040/radio7256.mp3' },
        { name: 'Новое Радио', url: 'https://icecast.newradio.cdnvideo.ru/newradio3' },
        { name: 'Business FM', url: 'https://bfm.hostingradio.ru/bfm96.aacp' },
        { name: 'Маруся FM', url: 'http://radio-holding.ru:9000/marusya_default' },
        { name: 'Комсомольская правда', url: 'https://kpradio.hostingradio.ru:8000/russia.radiokp128.mp3' },
        { name: 'Серебряный дождь', url: 'https://silverrain.hostingradio.ru/silver128.mp3' },
        { name: 'Maximum', url: 'https://maximum.hostingradio.ru/maximum96.aacp' },
        { name: 'Радио Культура', url: 'https://icecast.vgtrk.cdnvideo.ru/kultura_mp3_192kbps' },
        { name: 'Орфей (классика)', url: 'https://orpheus.hostingradio.ru:8010/orpheus128.mp3' },
        { name: 'Радио Record', url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
        { name: 'Record Chill-Out', url: 'https://radiorecord.hostingradio.ru/chil96.aacp' },
        { name: 'Record Lo-Fi', url: 'https://radiorecord.hostingradio.ru/lofi96.aacp' },
        { name: 'Record Deep', url: 'https://radiorecord.hostingradio.ru/deep96.aacp' },
        { name: 'Record Rock', url: 'https://radiorecord.hostingradio.ru/rock96.aacp' }
    ];

    var audio = window.__lampa_radio_audio || (window.__lampa_radio_audio = new Audio());
    var current = window.__lampa_radio_current || null;

    function RadioComponent(object) {
        var html = $('<div class="radio-list" style="height:calc(100vh - 6em);overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:8em;box-sizing:border-box"></div>');
        var last;
        var self = this;

        function play(st, item) {
            var list = Array.isArray(st.url) ? st.url : [st.url];
            var key = list[0];
            if (current === key && !audio.paused) {
                audio.pause();
                item.find('.radio-state').text('');
                return;
            }
            html.find('.radio-state').text('');
            current = window.__lampa_radio_current = key;

            var i = 0;
            function attempt() {
                audio.src = list[i];
                audio.play().then(function () {
                    item.find('.radio-state').text('▶');
                }).catch(function () {
                    i++;
                    if (i < list.length) attempt();
                    else Lampa.Noty.show('Не удалось воспроизвести: ' + st.name);
                });
            }
            attempt();
        }

        this.create = function () {
            stations.forEach(function (st) {
                var item = $(
                    '<div class="selector" style="display:flex;justify-content:space-between;' +
                    'padding:1em 1.5em;margin:.4em 1.5em;background:rgba(255,255,255,.08);' +
                    'border-radius:.5em;font-size:1.4em">' +
                    '<span>' + st.name + '</span><span class="radio-state"></span></div>'
                );
                if (current === (Array.isArray(st.url) ? st.url[0] : st.url) && !audio.paused) item.find('.radio-state').text('▶');

                item.on('hover:focus', function (e) {
                    last = e.target;
                    try { e.target.scrollIntoView({ block: 'center' }); } catch (err) {}
                });
                item.on('hover:enter', function () {
                    play(st, item);
                });
                html.append(item);
            });

            self.activity.loader(false);
            self.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add('radio_ru_plugin', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(last || false, html);
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
            Lampa.Controller.toggle('radio_ru_plugin');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            html.remove();
        };
    }

    function addMenu() {
        var btn = $(
            '<li class="menu__item selector">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
            '<path d="M3.2 7.5 20 2l.7 1.9L10 7.5H20a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 1.2-2zM8 11.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>' +
            '</svg></div><div class="menu__text">Радио РФ</div></li>'
        );
        btn.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Радио РФ',
                component: 'radio_ru_plugin',
                page: 1
            });
        });
        $('.menu .menu__list').eq(0).append(btn);
    }

    Lampa.Component.add('radio_ru_plugin', RadioComponent);

    if (window.appready) addMenu();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addMenu();
        });
    }
})();
