'use strict';

// Important note: since requirements for this project do not state
// that I must use a database, I have deliberately elected to store
// all data in memory.
//
// This is because the setup for this project fails to incorporate
// security measures required to prevent database pollution, and
// designing such measures is clearly beyond the scope of this
// project.
// Therefore, erasure of data upon application restart is arguably
// a *feature*.
//
// If I were to build a real product similar to this - MongoDB
// would be a natural choice.

const { isNull, notNull } = require('../core/utils');
const RuntimeDatabase = require('../core/database');

const database = new RuntimeDatabase();
const issueFields = [
    "_id",
    "open",
    "issue_title",
    "issue_text",
    "created_by",
    "assigned_to",
    "status_text",
    "created_on",
    "updated_on"
];
const modifiableFields = [
    "open",
    "issue_title",
    "issue_text",
    "created_by",
    "assigned_to",
    "status_text"
];

module.exports = function (app) {

    app.route('/api/issues/:project')
        .get(function (req, res) {
            const project = req.params.project;
            const criteria = {};

            for (const field of issueFields) {
                criteria[field] = req.query[field];
            }

            const issues = database.getFilteredIssues(project, criteria);

            return res.status(200).send(issues);
        })

        .post(function (req, res) {
            const project = req.params.project;
            const issueTitle = req.body.issue_title;
            const issueText = req.body.issue_text;
            const createdBy = req.body.created_by;
            let assignedTo = req.body.assigned_to ?? "";
            let statusText = req.body.status_text ?? "";

            if (isNull(issueTitle) || isNull(issueText) || isNull(createdBy))
                return res.status(200).send({ error: 'required field(s) missing' });

            const issue = database.createIssue(project, issueTitle, issueText, createdBy, assignedTo, statusText);

            return res.status(200).send(issue);
        })

        .put(function (req, res) {
            const project = req.params.project;
            const issueID = req.body._id;

            if (isNull(issueID))
                return res.status(200).send({ error: 'missing _id' });

            const data = {};
            let updateCount = 0;

            for (const field of modifiableFields) {
                let newValue = req.body[field];

                if (notNull(newValue)) {
                    data[field] = newValue;
                    updateCount++;
                }
            }

            if (updateCount === 0)
                return res.status(200).send({ error: 'no update field(s) sent', '_id': issueID });

            if (database.updateIssue(project, issueID, data))
                return res.status(200).send({ result: 'successfully updated', '_id': issueID });
            else
                return res.status(200).send({ error: 'could not update', '_id': issueID });
        })

        .delete(function (req, res) {
            const project = req.params.project;
            const issueID = req.body._id;

            if (isNull(issueID))
                return res.status(200).send({ error: 'missing _id' });

            if (database.deleteIssue(project, issueID))
                return res.status(200).send({ result: 'successfully deleted', '_id': issueID });
            else
                return res.status(200).send({ error: 'could not delete', '_id': issueID });

        });

};
