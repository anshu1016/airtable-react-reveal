export interface AirtableField {
  [key: string]: any;
}

export interface AirtableRecord {
  id: string;
  fields: AirtableField;
  createdTime: string;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}