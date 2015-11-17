$(function () {
  /**
   * カート内アイテム数を更新する。
   */
  updateCartItemsCount();

  /**
   * 文字入力を制限する。
   * (以下のクラス名指定で有効)
   */
  // 数値
  $('.numeric').numeric();
  // 整数
  $('.integer').numeric({ decimal: false });
  // 正の数値
  $('.positive').numeric({ negative: false });
  // 正の整数
  $('.positive-integer').numeric({ decimal: false, negative: false });
  // 「右クリック貼り付け」対応
  $('.antirc').change(function() {
    $(this).keyup();
  });

  /**
   * 複数のSubmitがあるFormでEnterキーが押された時のデフォルトボタンをクリックさせる。
   * デフォルトボタンはSubmitボタンに「class=defalut」を設定する。
   */
  $('form input').keypress(function(e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      var defaultButton = $(this).parents('form').find('input[type=submit].default');
      if (defaultButton.length == 1) {
          defaultButton.click();
          return false;
      }
    }
    return true;
  });

  /**
   * 二重Submitを防ぐ。
   */
  var submitted = false;
  $('form').submit(function(e) {
    // target属性付きのフォームは除外する。
    if ($(this).attr('target') === undefined)
    {
      if (submitted) {
        return false;
      }
      else {
        submitted = true;
      }
    }
  });

  $('#search').click(function () {
    var val = $('#zip').val().split('-').join('');

    // 郵便番号の桁数チェック
    if (!val.match(/^\d{7}$/)) {
      alert('郵便番号を正しく入力してください。');
      return false;
    }

    // 住所の取得
    getAddress(val)
    .done(function (d) {
      var addr,
          pref = '',
          city = '',
          coll = '',
          ward = '',
          street = '';

      // ステータスチェック
      if (d.status !== 'OK') {
        alert('入力された郵便番号から住所が取得できませんでした。');
        return false;
      }

      // データチェック
      if(!d.results.length) {
        alert('入力された郵便番号から住所が取得できませんでした。');
        return false;
      }

      addr = d.results[0].address_components;

      // 住所データの割り振り
      $(addr).each(function (d) {
        var type = this.types[0],
            name = this.long_name;

        // typeで切り分け
        switch (type) {
        case 'administrative_area_level_1': // 県
          pref = name;
          break;
        case 'locality': // 市区町村
          city = name;
          break;
        case 'colloquial_area': // 群
          coll = name;
          break;
        case 'ward': // 〜区など
          ward = name;
          break;
        case 'sublocality_level_1': // 以降
          street = name;
          break;
        default:
          break;
        }
      });

      // 群(coll)があれば、collをcityへ入れる
      // cityは町村なのでstreetと結合
      if (coll) {
        street = city + street;
        city = coll;
      }
      // 区と結合
      city += ward;

      // フォームへ適用
      $('#prefecture_id option').filter(function (i) {
        return $(this).text() === pref;
      })
      .prop('selected', true);
      $('#prefecture_id').change();

      $('#city').val(city);
      $('#city').trigger('restore');
      $('#street').val(street);
      $('#street').trigger('restore');

    })
    .fail(function () {

      alert('入力された郵便番号から住所が取得できませんでした。');
    });
  });

  /**
   * 郵便番号から住所を取得
   * @method getAddress
   * @param {string} zip 郵便番号
   * @return $.ajax
   */
  function getAddress(zip) {
    var protocol = document.location.protocol;
    var url = protocol + '//maps.googleapis.com/maps/api/geocode/json?',
        param = {
          sensor: false,
          language: 'ja',
          address: zip
        };

    return $.ajax({
      type: 'GET',
      url: url,
      dataType: 'JSON',
      data: param
    });
  }
});

/**
 * お届け先の順序変更
 * @method changeAddress
 * @param {int} id お届け先ID
 * @return $.ajax
 **/
function changeAddress( id, change, url ) {
  param = {
    id: id,
    type: change
  };

  $.ajax({
    type: 'post',
    url: url,
    dataType: 'JSON',
    data: param,
    cache: false,
    success : function(e) {
      if (e === 'success') {
	self.location.href = '/address';
      }
    }
  });
}

/**
 * カート内アイテム数表示を更新する。
 * (全画面)
 */
function updateCartItemsCount() {
  $.ajax({
    type: 'get',
    url: '/cart/count',
    cash: false,
  }).done(function(data) {
    if (data.result == 'success') {
      rewriteCartItemsCount(data.count);
    }
    else {
      alert(data.message);
    }
  }).fail(function(data) {
    alert('Network Error!');
  });
}

/**
 * カート内アイテム数表記を更新する。
 */
function rewriteCartItemsCount(num) {
  $('#cartItemsCount').text('(' + num.toString() + ')');
}
