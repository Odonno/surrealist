use std::vec;

use concat_string::concat_string;
use serde::Serialize;
use serde_wasm_bindgen::to_value;
use surrealdb::sql::{
    parse, statements::DefineStatement, thing, Index, Kind, Permissions, Statement, Strand,
};
use wasm_bindgen::prelude::*;

fn to_response<T: serde::ser::Serialize>(value: &T, name: &str) -> Result<JsValue, String> {
    Ok(to_value(value).expect(&concat_string!(name, " should be serializable")))
}

#[derive(Serialize)]
pub struct PermissionInfo {
    pub select: String,
    pub create: String,
    pub update: String,
    pub delete: String,
}

fn parse_permissions(perms: &Permissions) -> PermissionInfo {
    PermissionInfo {
        select: perms.select.to_string(),
        create: perms.create.to_string(),
        update: perms.update.to_string(),
        delete: perms.delete.to_string(),
    }
}

fn parse_comment(comment: &Option<Strand>) -> String {
    return comment
        .as_ref()
        .map(|s| s.as_str().to_owned())
        .unwrap_or_default();
}

#[derive(Serialize)]
pub struct ScopeInfo {
    pub name: String,
    pub signup: String,
    pub signin: String,
    pub session: String,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_scope_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Scope(s)) = query {
        let signup_query = s.signup.clone();
        let signin_query = s.signin.clone();

        let signup = match signup_query {
            Some(q) => q.to_string(),
            None => "()".to_owned(),
        };

        let signin = match signin_query {
            Some(q) => q.to_string(),
            None => "()".to_owned(),
        };

        let info = ScopeInfo {
            name: s.name.to_raw(),
            signup: signup[1..signup.len() - 1].to_owned(),
            signin: signin[1..signin.len() - 1].to_owned(),
            session: s.session.unwrap_or_default().to_string(),
            comment: parse_comment(&s.comment),
        };

        return to_response(&info, "scope");
    }

    Err(String::from("Failed to extract scope"))
}

#[derive(Serialize)]
pub struct TableViewInfo {
    pub expr: String,
    pub what: String,
    pub cond: String,
    pub group: String,
}

#[derive(Serialize)]
pub struct TableInfo {
    pub name: String,
    pub drop: bool,
    pub schemafull: bool,
    pub view: Option<TableViewInfo>,
    pub permissions: PermissionInfo,
    pub comment: String,
    pub changefeed: bool,
    pub changetime: String,
}

#[wasm_bindgen]
pub fn extract_table_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Table(t)) = query {
        let view = t.view.as_ref().map(|v| TableViewInfo {
            expr: v.expr.to_string(),
            what: v.what.to_string(),
            cond: v.cond.as_ref().map_or("".to_owned(), |c| c.to_string()),
            group: v.group.as_ref().map_or("".to_owned(), |c| c.to_string()),
        });

        let info = TableInfo {
            name: t.name.to_raw(),
            drop: t.drop,
            schemafull: t.full,
            comment: parse_comment(&t.comment),
            permissions: parse_permissions(&t.permissions),
            view,
            changefeed: t.changefeed.is_some(),
            changetime: t
                .changefeed
                .as_ref()
                .map_or("".to_owned(), |c| c.to_string()),
        };

        return to_response(&info, "table");
    }

    Err(String::from("Failed to extract table"))
}

#[derive(Serialize)]
pub struct FieldInfo {
    pub name: String,
    pub flexible: bool,
    pub kind: String,
    pub kind_meta: Vec<String>,
    pub value: String,
    pub assert: String,
    pub default: String,
    pub permissions: PermissionInfo,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_field_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Field(f)) = query {
        let kind = match &f.kind {
            Some(k) => match k {
                Kind::Record(_) => "record".to_owned(),
                Kind::Geometry(_) => "geometry".to_owned(),
                Kind::Option(_) => "option".to_owned(),
                Kind::Set(_, _) => "set".to_owned(),
                Kind::Array(_, _) => "array".to_owned(),
                other => other.to_string(),
            },
            None => "".to_owned(),
        };

        let kind_meta = match &f.kind {
            Some(k) => match k {
                Kind::Record(items) => items.iter().map(|i| i.to_string()).collect(),
                Kind::Geometry(items) => items.iter().map(|i| i.to_string()).collect(),
                Kind::Option(value) => vec![value.to_string()],
                Kind::Set(kind, max) | Kind::Array(kind, max) => match max {
                    Some(max) => vec![kind.to_string(), max.to_string()],
                    None => vec![kind.to_string()],
                },
                _ => vec![],
            },
            None => vec![],
        };

        let info = FieldInfo {
            name: f.name.to_string(),
            flexible: f.flex,
            kind,
            kind_meta,
            value: f.value.as_ref().map_or("".to_owned(), |v| v.to_string()),
            assert: f.assert.as_ref().map_or("".to_owned(), |a| a.to_string()),
            default: f.default.as_ref().map_or("".to_owned(), |v| v.to_string()),
            permissions: parse_permissions(&f.permissions),
            comment: parse_comment(&f.comment),
        };

        return to_response(&info, "field");
    }

    Err(String::from("Failed to extract field"))
}

#[derive(Serialize)]
pub struct AnalyzerInfo {
    pub name: String,
    pub tokenizers: Vec<String>,
    pub filters: Vec<String>,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_analyzer_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Analyzer(a)) = query {
        let tokenizers = a
            .tokenizers
            .as_ref()
            .map(|t| t.iter().map(|t| t.to_string()).collect())
            .unwrap_or_default();

        let filters = a
            .filters
            .as_ref()
            .map(|t| t.iter().map(|t| t.to_string()).collect())
            .unwrap_or_default();

        let info = AnalyzerInfo {
            name: a.name.to_string(),
            comment: parse_comment(&a.comment),
            tokenizers,
            filters,
        };

        return to_response(&info, "analyzer");
    }

    Err(String::from("Failed to extract index"))
}

#[derive(Serialize)]
pub enum IndexKind {
    Normal,
    Unique,
    Search,
    Vector,
}

#[derive(Serialize)]
pub struct IndexInfo {
    pub name: String,
    pub fields: String,
    pub kind: IndexKind,
    pub search: String,
    pub vector: String,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_index_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Index(i)) = query {
        let index_kind = match i.index {
            Index::Idx => IndexKind::Normal,
            Index::Uniq => IndexKind::Unique,
            Index::Search(_) => IndexKind::Search,
            Index::MTree(_) => IndexKind::Vector,
        };

        let empty_str = "".to_owned();
        let index_str = i.index.to_string();

        let (search, vector) = match i.index {
            Index::Search(_) => (&index_str, &empty_str),
            Index::MTree(_) => (&empty_str, &index_str),
            _ => (&empty_str, &empty_str),
        };

        let info = IndexInfo {
            name: i.name.to_string(),
            fields: i.cols.to_string(),
            kind: index_kind,
            search: search.to_owned(),
            vector: vector.to_owned(),
            comment: parse_comment(&i.comment),
        };

        return to_response(&info, "index");
    }

    Err(String::from("Failed to extract index"))
}

#[derive(Serialize)]
pub struct EventInfo {
    pub name: String,
    pub cond: String,
    pub then: String,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_event_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Event(e)) = query {
        let then = e.then.to_string();

        let info = EventInfo {
            name: e.name.to_string(),
            cond: e.when.to_string(),
            then: then[1..then.len() - 1].to_owned(),
            comment: parse_comment(&e.comment),
        };

        return to_response(&info, "event");
    }

    Err(String::from("Failed to extract event"))
}

#[derive(Serialize)]
pub struct UserInfo {
    pub name: String,
    pub roles: Vec<String>,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_user_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::User(u)) = query {
        let info = UserInfo {
            name: u.name.to_string(),
            roles: u
                .roles
                .iter()
                .map(|r| r.to_string())
                .collect::<Vec<String>>(),
            comment: parse_comment(&u.comment),
        };

        return to_response(&info, "user");
    }

    Err(String::from("Failed to extract user"))
}

#[derive(Serialize)]
pub struct FunctionArgInfo {
    pub name: String,
    pub kind: String,
}

#[derive(Serialize)]
pub struct FunctionInfo {
    pub name: String,
    pub block: String,
    pub arguments: Vec<FunctionArgInfo>,
    pub permission: String,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_function_definition(definition: &str) -> Result<JsValue, String> {
    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Function(f)) = query {
        let info = FunctionInfo {
            name: f.name.to_string(),
            block: format!("{:#}", f.block),
            permission: f.permissions.to_string(),
            comment: parse_comment(&f.comment),
            arguments: f
                .args
                .iter()
                .map(|a| FunctionArgInfo {
                    name: a.0.to_string(),
                    kind: a.1.to_string(),
                })
                .collect(),
        };

        return to_response(&info, "function");
    }

    Err(String::from("Failed to extract function"))
}

#[derive(Serialize)]
pub struct ModelInfo {
    pub name: String,
    pub hash: String,
    pub version: String,
    pub permission: String,
    pub comment: String,
}

#[wasm_bindgen]
pub fn extract_model_definition(definition: &str) -> Result<JsValue, String> {
    console_log!("Parsing {}", definition);

    let parsed = parse(definition)?;
    let query = &parsed[0];

    if let Statement::Define(DefineStatement::Model(m)) = query {
        let info = ModelInfo {
            name: m.name.to_string(),
            hash: m.hash.to_string(),
            version: m.version.to_string(),
            permission: m.permissions.to_string(),
            comment: parse_comment(&m.comment),
        };

        return to_response(&info, "model");
    }

    Err(String::from("Failed to extract model"))
}

const QUERY_TYPE_INVALID: &str = "invalid";
const QUERY_TYPE_NORMAL: &str = "normal";
const QUERY_TYPE_LIVE: &str = "live";
const QUERY_TYPE_MIXED: &str = "mixed";

#[wasm_bindgen]
pub fn extract_query_type(query: &str) -> String {
    match parse(query) {
        Err(_) => QUERY_TYPE_INVALID.into(),
        Ok(query) if query.iter().all(|s| matches!(s, Statement::Live(_))) => {
            QUERY_TYPE_LIVE.into()
        }
        Ok(query) if query.iter().all(|s| !matches!(s, Statement::Live(_))) => {
            QUERY_TYPE_NORMAL.into()
        }
        Ok(_) => QUERY_TYPE_MIXED.into(),
    }
}

#[wasm_bindgen]
pub fn validate_query(query: &str) -> Option<String> {
    let parsed = parse(query);

    match parsed {
        Ok(_) => None,
        Err(err) => Some(err.to_string()),
    }
}

#[wasm_bindgen]
pub fn validate_where_clause(clause: &str) -> bool {
    let query = "SELECT * FROM table WHERE ".to_owned() + clause;

    parse(&query).is_ok()
}

#[wasm_bindgen]
pub fn validate_thing(value: &str) -> bool {
    thing(value).is_ok()
}

#[wasm_bindgen]
pub fn format_query(value: &str) -> Option<String> {
    parse(value).ok().map(|q| q.to_string())
}

#[wasm_bindgen]
pub fn get_statement_count(value: &str) -> usize {
    return parse(value).unwrap().len();
}