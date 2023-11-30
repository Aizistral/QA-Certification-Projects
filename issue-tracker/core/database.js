const { notNull, parseBoolean } = require('./utils');
const crypto = require('crypto');

// I would sure worry about thread safety here if this was Java ☕
module.exports = class RuntimeDatabase {
    constructor() {
        const date = new Date().toISOString();

        this.projects = {
            apitest: [{
                "_id": "2465d42e-9156-4c3f-9d32-c49116e10165",
                "open": true,
                "issue_title": "The First Issue",
                "issue_text": "Some text here",
                "created_by": "Aizistral",
                "assigned_to": "NotAizistral",
                "status_text": "Awaiting Review",
                "created_on": date,
                "updated_on": date
            }]
        };
    }

    /**
     * @param {string} projectID
     * @returns {Array}
     */
    getIssues(projectID) {
        const issues = this.projects[projectID];

        if (!issues)
            return [];
        else
            return issues;
    }

    /**
     * @param {string} projectID
     * @param {Object} criteria
     */
    getFilteredIssues(projectID, criteria) {
        const issues = this.getIssues(projectID);
        const filtered = [];

        for (const issue of issues) {
            let allMatch = true;

            for (const key of Object.keys(criteria)) {
                let filterValue = criteria[key];
                let issueValue = issue[key];

                if (notNull(filterValue) && notNull(issueValue)) {
                    if (typeof issueValue === 'boolean') {
                        filterValue = parseBoolean(filterValue);
                    }

                    if (issueValue !== filterValue) {
                        allMatch = false;
                    }
                }
            }

            if (allMatch) {
                filtered.push(issue);
            }
        }

        return filtered;
    }

    /**
     * @param {string} projectID
     * @param {string} title
     * @param {string} text
     * @param {string} author
     * @param {string} assignedTo
     * @param {string} statusText
     */
    createIssue(projectID, title, text, author, assignedTo, statusText) {
        const date = new Date().toISOString();
        const id = crypto.randomUUID();

        const issue = {
            "_id": id,
            "open": true,
            "issue_title": title.toString(),
            "issue_text": text.toString(),
            "created_by": author.toString(),
            "assigned_to": assignedTo.toString(),
            "status_text": statusText.toString(),
            "created_on": date,
            "updated_on": date
        };

        let issues = this.projects[projectID];

        if (!issues) {
            this.projects[projectID] = issues = [issue];
        } else {
            issues.push(issue);
        }

        return issue;
    }

    /**
     * @param {string} projectID
     * @param {string} issueID
     * @param {Object} data
     */
    updateIssue(projectID, issueID, data) {
        const issues = this.getFilteredIssues(projectID, { "_id": issueID });
        let success = false;

        for (const issue of issues) {
            let affected = false;

            for (const key of Object.keys(issue)) {
                if (key === "_id" || key === "created_on" || key === "updated_on")
                    continue;

                if (notNull(data[key])) {
                    if (key === "open") {
                        issue[key] = parseBoolean(data[key]);
                    } else {
                        issue[key] = data[key].toString();
                    }

                    success = affected = true;
                }
            }

            if (affected) {
                issue["updated_on"] = new Date().toISOString();
            }
        }

        return success;
    }

    /**
     * @param {string} projectID
     * @param {string} issueID
     */
    deleteIssue(projectID, issueID) {
        const issues = this.getFilteredIssues(projectID, { "_id": issueID });
        let success = false;

        for (const issue of issues) {
            const issueIndex = this.getIssues(projectID).indexOf(issue);

            if (issueIndex >= 0) {
                this.getIssues(projectID).splice(issueIndex, 1);
                success = true;
            }
        }

        return success;
    }

}