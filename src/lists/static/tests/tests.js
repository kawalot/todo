/* global sinon */
var server, sandbox;
QUnit.testStart(function () {
    server = sinon.fakeServer.create();
    sandbox = sinon.sandbox.create();
});
QUnit.testDone(function () {
    server.restore();
    sandbox.restore();
});

QUnit.test("should updateItems on initialize", function (assert) {
    var url = '/getitems/';
    sandbox.spy(window.Superlists, 'updateItems');
    window.Superlists.initialize(url);
    assert.equal(
        window.Superlists.updateItems.lastCall.args,
        url
    );
});

QUnit.test("updateItems should get correct url by ajax", function (assert) {
    var url = '/getitems/';
    window.Superlists.updateItems(url);

    assert.equal(server.requests.length, 1)
    var request = server.requests[0];
    assert.equal(request.method, 'GET');
})

QUnit.test("updateItems should fill in lists table from ajax response", function (assert) {
    var url ='/getitems/';
    var responseData = [
        {'id': 101, 'text': 'item 1 text'},
        {'id': 102, 'text': 'item 2 text'},
    ];
    server.respondWith('GET', url, [
        200, {"Content-Type": "application/json"}, JSON.stringify(responseData)
    ]);
    window.Superlists.updateItems(url);

    server.respond();

    var rows = $('#id_list_table tr');
    assert.equal(rows.length, 2);
    var row1 = $('#id_list_table tr:first-child td');
    assert.equal(row1.text(), '1: item 1 text');
    var row2 = $('#id_list_table tr:last-child td');
    assert.equal(row2.text(), '2: item 2 text');
});

QUnit.test("should intercept form submit and do ajax post", function (assert) {
    var url = '/listitemsapi/';
    window.Superlists.initialize(url);

    $('#id_item_form input[name="text"]').val('user input');
    $('#id_item_form input[name="csrfmiddlewaretoken"]').val('tokeney');
    $('#id_item_form').submit();

    assert.equal(server.requests.length, 2);
    var request = server.requests[1];
    assert.equal(request.url, url);
    assert.equal(request.method, "POST");
    assert.equal(
        request.requestBody,
        'text=user+input&csrfmiddlewaretoken=tokeney'
    );
});

QUnit.test("should call updateItems after successful post", function (assert) {
    var url = '/listitemsapi/';
    window.Superlists.initialize(url);
    var response = [
        201,
        {"Content-Type": "application/json"},
        JSON.stringify({}),
    ];
    server.respondWith('POST', url, response);
    $('#id_item_form input[name="text"]').val('user input');
    $('#id_item_form input[name="csrfmiddlewaretoken"]').val('tokeney');
    $('#id_item_form').submit();

    sandbox.spy(window.Superlists, 'updateItems');
    server.respond();

    assert.equal(
        window.Superlists.updateItems.lastCall.args,
        url
    );
});

QUnit.test("errors should be hidden on keypress", function (assert) {
    window.Superlists.initialize();
    $('input[name="text"]').trigger('keypress');
    assert.equal($('.has-error').is(':visible'), false);
});
QUnit.test("errors aren't hidden if there is no keypress", function (assert) {
    window.Superlists.initialize();
    assert.equal($('.has-error').is(':visible'), true);
});

QUnit.test("should display errors on post failure", function (assert) {
    var url = '/listitemsapi/';
    window.Superlists.initialize(url);
    server.respondWith('POST', url, [
        400,
        {"Content-Type": "application/json"},
        JSON.stringify({'error': 'something is amiss'})
    ]);
    $('.has-error').hide();

    $('#id_item_form').submit();
    server.respond(); // post

    assert.equal($('.has-error').is(':visible'), true);
    assert.equal($('.has-error .help-block').text(), 'something is amiss');
});