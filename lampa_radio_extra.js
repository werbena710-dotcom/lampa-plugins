(function () {
    'use strict';

    if (window.plugin_lampa_radio_extra_v1) return;
    window.plugin_lampa_radio_extra_v1 = true;

    var EXCLUDED = ["bbc world service","business fm","dfm","europa plus","maximum","radio paradise","radio paradise mellow","radio swiss classic","radio swiss jazz","record chill-out","record deep","record lo-fi","record rock","retro fm","somafm beat blender","somafm deep space one","somafm drone zone","somafm fluid","somafm folk forward","somafm groove salad","somafm illinois street lounge","somafm indie pop rocks","somafm lush","somafm secret agent","somafm space station","somafm suburbs of goa","somafm synphaera","somafm the trip","somafm thistle radio","авторадио","вести fm","дорожное радио","европа плюс","комсомольская правда","маруся fm","маяк","монте-карло","наше радио","новое радио","орфей (классика)","радио 7 на семи холмах","радио record","радио дача","радио культура","радио маяк","радио монте-карло","радио россии","радио шансон","ретро fm","русское радио","серебряный дождь","хит fm","шансон"];

    var API_HOSTS = [
        'https://de1.api.radio-browser.info',
        'https://nl1.api.radio-browser.info',
        'https://at1.api.radio-browser.info'
    ];

    var audio = window.__lampa_radio_extra_audio ||
        (window.__lampa_radio_extra_audio = new Audio());
    var currentUrl = '';
    var stations = [];

    function normalize(value) {
        return String(value || '').toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/[^a-zа-я0-9]+/g, ' ').trim();
    }

    function isExcluded(name) {
        var n = normalize(name);
        return EXCLUDED.some(function (oldName) {
            var old = normalize(oldName);
            return n === old || (old.length > 5 && n.indexOf(old) !== -1);
        });
    }

    function RadioExtraComponent(object) {
        var self = this;
        var html = $('<div style="height:calc(100vh - 6em);overflow-y:auto;padding:1em 0 8em"></div>');
        var last = null;

        function message(text) {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show(text);
        }

        function renderList() {
            html.empty();
            if (!stations.length) {
                html.append('<div style="padding:2em;text-align:center">Новых станций не найдено.</div>');
                return;
            }

            stations.forEach(function (st) {
                var item = $('<div class="selector" style="padding:1em;margin:.35em 1em;background:rgba(255,255,255,.08);border-radius:.5em;font-size:1.25em;display:flex;justify-content:space-between"><span class="radio-name"></span><span class="radio-state"></span></div>');
                item.find('.radio-name').text(st.name);

                if (currentUrl === st.url && !audio.paused) {
                    item.find('.radio-state').text('▶');
                }

                item.on('hover:focus', function (e) {
                    last = e.target;
                    try { e.target.scrollIntoView({block:'center'}); } catch (err) {}
                });

                item.on('hover:enter', function () {
                    if (currentUrl === st.url && !audio.paused) {
                        audio.pause();
                        item.find('.radio-state').text('');
                        return;
                    }

                    html.find('.radio-state').text('');
                    currentUrl = st.url;
                    audio.src = st.url;

                    audio.play().then(function () {
                        html.find('.radio-state').text('');
                        item.find('.radio-state').text('▶');
                    }).catch(function () {
                        message('Не удалось запустить: ' + st.name);
                    });
                });

                html.append(item);
            });
        }

        function loadFrom(index) {
            if (index >= API_HOSTS.length) {
                html.html('<div style="padding:2em;text-align:center">Не удалось загрузить каталог. Проверьте интернет.</div>');
                return;
            }

            $.ajax({
                url: API_HOSTS[index] + '/json/stations/bycountrycodeexact/RU?limit=300&order=clickcount&reverse=true&hidebroken=true',
                method: 'GET',
                dataType: 'json',
                timeout: 12000,

                success: function (data) {
                    var seen = {};

                    stations = (Array.isArray(data) ? data : []).filter(function (st) {
                        var name = String(st.name || '').trim();
                        var stream = String(st.url_resolved || st.url || '').trim();
                        var key = normalize(name);

                        if (!name || !stream || !/^https?:\/\//i.test(stream)) return false;
                        if (isExcluded(name) || seen[key]) return false;
                        if (Number(st.lastcheckok) === 0) return false;

                        seen[key] = true;
                        return true;
                    }).map(function (st) {
                        return {
                            name: String(st.name).trim(),
                            url: String(st.url_resolved || st.url).trim()
                        };
                    });

                    renderList();
                },

                error: function () {
                    loadFrom(index + 1);
                }
            });
        }

        this.create = function () {
            html.html('<div style="padding:2em;text-align:center">Загружаю радиостанции…</div>');
            loadFrom(0);
            self.activity.loader(false);
            self.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add('radio_extra_controller', {
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
            Lampa.Controller.toggle('radio_extra_controller');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () { html.remove(); };
    }

    function addMenu() {
        if ($('.menu__list .radio-extra-menu').length) return;

        var btn = $('<li class="menu__item selector radio-extra-menu"><div class="menu__ico">▶</div><div class="menu__text">Радио +</div></li>');

        btn.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Дополнительное радио',
                component: 'radio_extra_component',
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(btn);
    }

    Lampa.Component.add('radio_extra_component', RadioExtraComponent);

    if (window.appready) addMenu();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addMenu();
        });
    }
})();
