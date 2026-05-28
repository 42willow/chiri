use super::values::{get_string, owned_value, VariantDict};

pub(super) fn build_register_args(
    service_name: &str,
    token: &str,
    vapid_public_key: Option<&str>,
    description: Option<&str>,
) -> Result<VariantDict, String> {
    let mut args = VariantDict::new();
    args.insert(
        "service".into(),
        owned_value(service_name.to_string()).map_err(|e| e.to_string())?,
    );
    args.insert(
        "token".into(),
        owned_value(token.to_string()).map_err(|e| e.to_string())?,
    );

    if let Some(description) = description.filter(|value| !value.trim().is_empty()) {
        args.insert(
            "description".into(),
            owned_value(description.to_string()).map_err(|e| e.to_string())?,
        );
    }

    if let Some(vapid) = vapid_public_key.filter(|value| !value.trim().is_empty()) {
        args.insert(
            "vapid".into(),
            owned_value(vapid.to_string()).map_err(|e| e.to_string())?,
        );
    }

    Ok(args)
}

pub(super) fn register_result_failed(result: &VariantDict) -> bool {
    get_string(result, "success")
        .map(|success| success == "REGISTRATION_FAILED")
        .unwrap_or(false)
}
