const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const crypto = require('crypto');

chai.use(chaiHttp);

const generatedProperties = ["_id", "created_on", "updated_on"];
const optionalProperties = ["assigned_to", "status_text"];

suite('Functional Tests', function () {
    this.timeout(5000);

    const project = "apitest";
    const target = "/api/issues/" + project;

    const issue_1 = {
        "issue_title": "Test Issue #1",
        "issue_text": "Very important text",
        "created_by": "Test System",
        "assigned_to": "Aizistral",
        "status_text": "Exists"
    };

    const issue_2 = {
        "issue_title": "Test Issue #2",
        "issue_text": "Equally important text",
        "created_by": "Test System"
    };

    const issue_3 = {
        "issue_title": "Test Issue #3",
        "assigned_to": "Aizistral",
        "status_text": "Doesn't Really Exist"
    };

    test(`POST with all fields at ${target}`, function (done) {
        const issue = issue_1;

        chai.request(server)
            .keepOpen()
            .post(target)
            .send(issue)
            .end(function (err, res) {
                assert.equal(res.status, 200);

                for (const property of generatedProperties) {
                    assert.isString(res.body[property], "Invalid " + property);
                    issue[property] = res.body[property];
                }

                for (const key of Object.keys(issue)) {
                    assert.strictEqual(res.body[key], issue[key], "Invalid " + key);
                }

                done();
            });
    });

    test(`POST with required fields at ${target}`, function (done) {
        const issue = issue_2;

        chai.request(server)
            .keepOpen()
            .post(target)
            .send(issue)
            .end(function (err, res) {
                assert.equal(res.status, 200);

                for (const property of generatedProperties) {
                    assert.isString(res.body[property], "Invalid " + property);
                    issue[property] = res.body[property];
                }

                for (const key of Object.keys(issue)) {
                    assert.strictEqual(res.body[key], issue[key], "Invalid " + key);
                }

                for (const property of optionalProperties) {
                    assert.strictEqual(res.body[property], "", "Invalid " + property);
                    issue[property] = res.body[property];
                }

                done();
            });
    });

    test(`POST with missing required fields at ${target}`, function (done) {
        const issue = issue_3;

        chai.request(server)
            .keepOpen()
            .post(target)
            .send(issue)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'required field(s) missing' });
                done();
            });
    });

    test(`GET issues at ${target}`, function (done) {
        chai.request(server)
            .keepOpen()
            .get(target)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);

                for (const issue of [issue_1, issue_2]) {
                    let remoteIssue = null;

                    for (const bodyIssue of res.body) {
                        if (bodyIssue.issue_title === issue.issue_title) {
                            remoteIssue = bodyIssue;
                            break;
                        }
                    }

                    if (!remoteIssue)
                        assert.fail(`Failed to locate ${issue.issue_title} at remote`);

                    for (const key of Object.keys(issue)) {
                        assert.strictEqual(remoteIssue[key], issue[key], `Invalid ${key} in ${issue.issue_title}`);
                    }
                }

                done();
            });
    });

    test(`GET issues with on filter at ${target}`, function (done) {
        chai.request(server)
            .keepOpen()
            .get(target + "?open=true")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtLeast(res.body.length, 2);
                done();
            });
    });

    test(`GET issues with 3 filters at ${target}`, function (done) {
        const title = encodeURIComponent(issue_2.issue_title);
        const text = encodeURIComponent(issue_2.issue_text);

        chai.request(server)
            .keepOpen()
            .get(`${target}?open=true&issue_title=${title}&issue_text=${text}`)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.strictEqual(res.body.length, 1);
                done();
            });
    });

    test(`PUT one new field at ${target}`, function (done) {
        issue_1.status_text = "Vibrates Intensely";

        chai.request(server)
            .keepOpen()
            .put(target)
            .send({
                _id: issue_1._id,
                status_text: issue_1.status_text
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                    result: "successfully updated",
                    _id: issue_1._id
                });
                done();
            });
    });

    test(`PUT 2 new fields at ${target}`, function (done) {
        issue_2.issue_title += "+1";
        issue_2.created_by = "Bakabadoom";

        chai.request(server)
            .keepOpen()
            .put(target)
            .send({
                _id: issue_2._id,
                issue_title: issue_2.issue_title,
                created_by: issue_2.created_by
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                    result: "successfully updated",
                    _id: issue_2._id
                });
                done();
            });
    });

    test(`PUT with missing _id at ${target}`, function (done) {
        chai.request(server)
            .keepOpen()
            .put(target)
            .send({
                issue_title: "Test Issue #3+1"
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: "missing _id" });
                done();
            });
    });

    test(`PUT with missing fields at ${target}`, function (done) {
        chai.request(server)
            .keepOpen()
            .put(target)
            .send({
                _id: issue_1._id
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                    error: 'no update field(s) sent',
                    _id: issue_1._id
                });
                done();
            });
    });

    test(`PUT with invalid _id at ${target}`, function (done) {
        const _id = crypto.randomUUID();

        chai.request(server)
            .keepOpen()
            .put(target)
            .send({
                issue_title: "Test Issue #22",
                issue_text: "Huzzah hadah",
                _id
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not update', _id });
                done();
            });
    });

    test(`DELETE normally at ${target}`, function (done) {
        const _id = issue_1._id;

        chai.request(server)
            .keepOpen()
            .delete(target)
            .send({ _id })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully deleted', _id });
                done();
            });
    });

    test(`DELETE with invalid _id at ${target}`, function (done) {
        const _id = crypto.randomUUID();

        chai.request(server)
            .keepOpen()
            .delete(target)
            .send({ _id })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not delete', _id });
                done();
            });
    });

    test(`DELETE with missing _id at ${target}`, function (done) {
        chai.request(server)
            .keepOpen()
            .delete(target)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'missing _id' });
                done();
            });
    });
});
