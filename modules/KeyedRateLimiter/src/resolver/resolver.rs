use schema::schema::{Schema, Argument};
use redis_module::RedisError;
use schema::arg_type::ArgType;
use std::str::FromStr;

macro_rules! handled_iter_option {
    ($matcher:expr, $idx:expr) => {
        match $matcher.iter().nth($idx) {
            None => {
                Err(RedisError::String(format!("Argument not provided for index {}", $idx)))?
            },
            Some(value) => value
        }
    }
}

pub struct Resolver {
    schema: Schema,
    cmd_args: Vec<String>,
}

impl Resolver {
    pub fn new(schema: Schema, cmd_args: Vec<String>) -> Resolver {
        Resolver{
            schema,
            cmd_args,
        }
    }
    pub fn all_as_str(&mut self) -> Result<String, RedisError> {
        let mut return_string: String = String::new();
        for i in 0..self.cmd_args.len() {
            let ith_schema_arg: &Argument = handled_iter_option!(self.schema.args, i);
            let ith_cmd_arg: &String = handled_iter_option!(self.cmd_args, i);
            return_string.push_str(format!(
                "[{:?}: {:?}]",
                ith_schema_arg.name,
                ith_cmd_arg
            ).as_str());
        }
        return Ok(return_string)
    }
    pub fn at<T: FromStr<Err = RedisError>>(&mut self, idx: usize) -> Result<T, RedisError> {
        let schema_arg: &Argument = handled_iter_option!(self.schema.args, idx);
        let cmd_arg: &String = handled_iter_option!(self.cmd_args, idx);
        macro_rules! parse_forward_err {
            ($cmd_arg:expr, $schm_arg:expr, $parse_to:ty) => {
                match FromStr::from_str($cmd_arg.as_str()) {
                    Err(_) => Err(RedisError::String(format!("Argument could not be parsed as type {:?}", $schm_arg.arg)))?,
                    Ok(value) => Ok(value),
                }
            }
        }
        match schema_arg.arg {
            ArgType::INT => parse_forward_err!(cmd_arg, schema_arg, usize),
            ArgType::STRING => parse_forward_err!(cmd_arg, schema_arg, String),
            ArgType::FLOAT => parse_forward_err!(cmd_arg, schema_arg, f32),
            ArgType::BOOL => parse_forward_err!(cmd_arg, schema_arg, bool),
        }
    }
    fn try_coerce(&self, schema_arg: &Argument, cmd_arg: &String) -> Option<RedisError> {
        macro_rules! parse_check_err {
            ($cmd_arg:expr, $parse_to:ty) => {
                $cmd_arg.as_str().parse::<$parse_to>().is_err()
            }
        }
        let result: bool = match schema_arg.arg {
            ArgType::INT => parse_check_err!(cmd_arg, usize),
            ArgType::STRING => parse_check_err!(cmd_arg, String),
            ArgType::FLOAT => parse_check_err!(cmd_arg, f32),
            ArgType::BOOL => parse_check_err!(cmd_arg, bool),
        };
        if !result {
            return Some(RedisError::String(format!("Argument could not be parsed as type {:?}", schema_arg.arg)))
        }
        None
    }
    pub fn validate(&self) -> Option<RedisError> {
        if self.schema.args.len() != self.cmd_args.len() {
            Some(RedisError::String(format!(
                "Provided arguments differ in quantity to schema definition: [schema: {:?}] != [provided: {:?}]",
                self.schema.args.len(),
                self.cmd_args.len()
            )));
        }
        macro_rules! iter_some_on_error {
            ($matcher:expr, $idx:expr, $var:ident) => {
                if let Some(v) = $matcher.iter().nth($idx) {
                    $var = v;
                } else {
                    return Some(RedisError::String(format!("Argument not provided for index {}", $idx)));
                }
            }
        }
        for i in 0..self.schema.args.len() {
            let ith_schema_arg: &Argument;
            iter_some_on_error!(self.schema.args, i, ith_schema_arg);
            let ith_cmd_arg: &String;
            iter_some_on_error!(self.cmd_args, i, ith_cmd_arg);
            if let Some(e) = self.try_coerce(ith_schema_arg, ith_cmd_arg) {
                return Some(e);
            }
        }
        None
    }
}