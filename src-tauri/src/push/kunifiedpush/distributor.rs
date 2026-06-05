use zbus::{fdo::DBusProxy, Connection};

const DISTRIBUTOR_PREFIX: &str = "org.unifiedpush.Distributor.";

pub(super) async fn list_distributors(connection: &Connection) -> Result<Vec<String>, String> {
    let proxy = DBusProxy::new(connection)
        .await
        .map_err(|e| e.to_string())?;
    let mut names: Vec<String> = proxy
        .list_names()
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|name| name.to_string())
        .filter(|name| name.starts_with(DISTRIBUTOR_PREFIX))
        .collect();

    let activatable = proxy
        .list_activatable_names()
        .await
        .map_err(|e| e.to_string())?;
    names.extend(
        activatable
            .into_iter()
            .map(|name| name.to_string())
            .filter(|name| name.starts_with(DISTRIBUTOR_PREFIX)),
    );

    names.sort();
    names.dedup();
    Ok(names)
}

pub(super) async fn choose_distributor(connection: &Connection) -> Result<String, String> {
    let distributors = list_distributors(connection).await?;
    if distributors.is_empty() {
        return Err("No UnifiedPush distributor is available".into());
    }

    if let Ok(preferred) = std::env::var("UNIFIEDPUSH_DISTRIBUTOR") {
        if preferred.starts_with(DISTRIBUTOR_PREFIX)
            && distributors.iter().any(|name| name == &preferred)
        {
            return Ok(preferred);
        }
    }

    Ok(distributors[0].clone())
}
