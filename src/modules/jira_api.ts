class JiraAPI {
    async createIssue(messageData: Object): Promise<any> {
        /**
    curl -X POST -u "log:pass" 'https://ott-support.atlassian.net/rest/api/3/issue' \                                                            ✘ INT at   23:09:51
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{
    "fields": {
      "summary": "Testing create api",
      "issuetype": {
        "name": "Story"
      },
      "project": {
        "key": "SUP"
      },
      "description": {
        "type": "doc",
        "version": 1,
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "text": "Some random text",
                "type": "text"
              }
            ]
          }
        ]
      }
    }
  }'    

         */
        
    }

    async getAllIssues(): Promise<any>{
        /**
         * curl -D- -u "log:pass" -X GET \                                                                                                                ✘ INT at   23:17:23
            -H "Content-Type: application/json" \
            "https://ott-support.atlassian.net/rest/api/2/search?jql="

         */
    }


    async moveIssue(status: string): Promise<void> {
        /**
         * curl -u "log:pass" -X POST --data '{                                                                                                                 at   23:37:49
    "update": {
    "transition": {
        "id": "31"
    }
}' -H "Content-Type: application/json" https://ott-support.atlassian.net/rest/api/2/issue/{issue}/transitions


         */
    }
}