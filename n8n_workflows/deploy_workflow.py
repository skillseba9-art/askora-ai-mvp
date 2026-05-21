import urllib.request
import urllib.error
import json
import ssl

# Configuration
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMGNmYjVhZi01ZmE0LTRiYWItOGJiNy00ZjUzZWVhZGE0ZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNzkxZDI2MDktMTcwOC00YzEyLTgzZGUtZTliYTg2OWQ3Y2I5IiwiaWF0IjoxNzc5Mjg1OTY5LCJleHAiOjE3ODE4MDU2MDB9.4qOYRv0RZoiQCWXANq_FLhGjfjgzr490nD9ILAy7-XY"
WORKFLOW_ID = "auhPXoiiaXRmHgjR"
HOST_URL = "https://n8n.skillseba.com"
OPENROUTER_KEY = "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"
TWILIO_SID = "AC45202ae0409320a371d9a6d054b5eef4"
TWILIO_TOKEN = "0fbdbb64a9a8db69afa5dd33a6f6c301"

# Context bypass for SSL errors if self-hosted certificates are self-signed
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_current_workflow():
    url = f"{HOST_URL}/api/v1/workflows/{WORKFLOW_ID}"
    req = urllib.request.Request(url)
    req.add_header("X-N8N-API-KEY", N8N_API_KEY)
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Error fetching workflow: {e}")
        return None

def update_workflow(workflow_data):
    url = f"{HOST_URL}/api/v1/workflows/{WORKFLOW_ID}"
    req = urllib.request.Request(url, method="PUT")
    req.add_header("X-N8N-API-KEY", N8N_API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    
    data_bytes = json.dumps(workflow_data).encode('utf-8')
    
    try:
        with urllib.request.urlopen(req, data=data_bytes, context=ctx) as response:
            print("Successfully updated workflow on n8n server!")
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Error updating workflow: {e}")
        if hasattr(e, 'read'):
            print(f"Server response: {e.read().decode('utf-8')}")
        return None

def main():
    print("Fetching existing workflow from n8n...")
    current = get_current_workflow()
    if not current:
        print("Failed to fetch workflow. Aborting.")
        return
    
    # Extract existing Webhook configuration to preserve URL path
    webhook_node = None
    for node in current.get("nodes", []):
        if node.get("type") == "n8n-nodes-base.webhook":
            webhook_node = node
            break
            
    if not webhook_node:
        print("No Webhook node found in existing workflow! Creating a default one.")
        webhook_node = {
            "parameters": {
                "httpMethod": "POST",
                "path": "vapi-call-end",
                "options": {}
            },
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2.1,
            "position": [0, 0],
            "id": "webhook-node-id",
            "name": "Webhook",
            "webhookId": "vapi-call-end"
        }
    
    print(f"Preserving Webhook path: {webhook_node['parameters'].get('path')}")
    
    # Design new premium nodes list
    new_nodes = [
        webhook_node,
        {
            "parameters": {
                "method": "POST",
                "url": "https://openrouter.ai/api/v1/chat/completions",
                "sendHeaders": True,
                "headerParameters": {
                    "parameters": [
                        {
                            "name": "Authorization",
                            "value": f"Bearer {OPENROUTER_KEY}"
                        },
                        {
                            "name": "Content-Type",
                            "value": "application/json"
                        }
                    ]
                },
                "sendBody": True,
                "contentType": "json",
                "bodyParameters": {
                    "parameters": [
                        {
                            "name": "model",
                            "value": "meta-llama/llama-3-70b-instruct:free"
                        },
                        {
                            "name": "response_format",
                            "value": "={ \"type\": \"json_object\" }"
                        }
                    ]
                },
                "specifyBody": "json",
                "jsonBody": "={\"model\": \"meta-llama/llama-3-70b-instruct:free\", \"response_format\": {\"type\": \"json_object\"}, \"messages\": [{\"role\": \"system\", \"content\": \"You are Clara, an AI lead extractor. Analyze the call details and extract into JSON: {\\\"callerName\\\": \\\"extracted name or Unknown\\\", \\\"serviceRequested\\\": \\\"dental service or query\\\", \\\"leadTemperature\\\": \\\"Hot | Warm | Cold\\\", \\\"callSummary\\\": \\\"one sentence summary\\\", \\\"wantsBooking\\\": true, \\\"email\\\": \\\"email if mentioned, else null\\\"}. Output ONLY valid JSON.\"}, {\"role\": \"user\", \"content\": \"Call Phone: {{ $json.body.message.customer.number }}\\nTranscript:\\n{{ $json.body.message.transcript }}\"}]}",
                "options": {}
            },
            "id": "openrouter-api-node",
            "name": "OpenRouter LLM Extractor",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [250, 0]
        },
        {
            "parameters": {
                "jsCode": "const responseText = items[0].json.choices[0].message.content;\nlet parsedData;\ntry {\n  parsedData = JSON.parse(responseText);\n} catch(e) {\n  parsedData = { callerName: \"Unknown\", serviceRequested: \"General inquiry\", leadTemperature: \"Warm\", callSummary: responseText };\n}\nreturn [{ json: parsedData }];"
            },
            "id": "parse-json-code-node",
            "name": "Parse JSON Content",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [480, 0]
        },
        {
            "parameters": {
                "method": "POST",
                "url": f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json",
                "authentication": "basicAuth",
                "sendBody": True,
                "contentType": "form-urlencoded",
                "bodyParameters": {
                    "parameters": [
                        {
                            "name": "From",
                            "value": "+18885559087"
                        },
                        {
                            "name": "To",
                            "value": "={{ $('Webhook').item.json.body.message.customer.number }}"
                        },
                        {
                            "name": "Body",
                            "value": "=Hi {{ $json.callerName }}, thank you for calling! Since you are interested in {{ $json.serviceRequested }}, you can book an appointment using our Calendly portal: https://calendly.com/radiant-dental/appointment"
                        }
                    ]
                },
                "options": {}
            },
            "id": "twilio-sms-http-node",
            "name": "Twilio SMS Sender",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [720, -100],
            "credentials": {
                "httpBasicAuth": {
                    "id": "twilio-basic-auth-id",
                    "name": "Twilio Basic Auth"
                }
            }
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://your-askora-backend-url.com/api/leads",
                "sendBody": True,
                "contentType": "json",
                "bodyParameters": {
                    "parameters": [
                        {
                            "name": "name",
                            "value": "={{ $json.callerName }}"
                        },
                        {
                            "name": "phone",
                            "value": "={{ $('Webhook').item.json.body.message.customer.number }}"
                        },
                        {
                            "name": "email",
                            "value": "={{ $json.email }}"
                        },
                        {
                            "name": "service",
                            "value": "={{ $json.serviceRequested }}"
                        },
                        {
                            "name": "status",
                            "value": "={{ $json.leadTemperature }}"
                        },
                        {
                            "name": "notes",
                            "value": "={{ $json.callSummary }}"
                        }
                    ]
                },
                "options": {}
            },
            "id": "backend-leads-api-node",
            "name": "Backend Leads Database",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [720, 100]
        }
    ]

    # Create connections between nodes
    new_connections = {
        webhook_node["name"]: {
            "main": [
                [
                    {
                        "node": "OpenRouter LLM Extractor",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "OpenRouter LLM Extractor": {
            "main": [
                [
                    {
                        "node": "Parse JSON Content",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Parse JSON Content": {
            "main": [
                [
                    {
                        "node": "Twilio SMS Sender",
                        "type": "main",
                        "index": 0
                    },
                    {
                        "node": "Backend Leads Database",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    }

    # Update current payload nodes
    current["nodes"] = new_nodes
    current["connections"] = new_connections
    current["settings"] = {}
    
    # Prune read-only properties to avoid n8n API validation errors (Bad Request)
    allowed_keys = {"name", "nodes", "connections", "settings", "staticData"}
    pruned_current = {k: v for k, v in current.items() if k in allowed_keys}
    
    # Save the JSON locally as well for backup
    with open("updated_workflow_backup.json", "w") as f:
        json.dump(pruned_current, f, indent=2)
        
    print("Pushing updated workflow back to n8n server...")
    update_workflow(pruned_current)

if __name__ == "__main__":
    main()
