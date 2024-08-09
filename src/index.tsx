import { List, Cache } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useDeferredValue, useState } from "react";

import { Collocation, parseHtml } from "./parseHtml";
import { remapType } from "./remapType";

const cache = new Cache();

export default function Command() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const url = `https://www.freecollocation.com/search?word=${deferredQuery}`;
  const hasCache = cache.has(deferredQuery);
  const { data, isLoading } = useFetch<string>(url, {
    execute: !!deferredQuery && !hasCache,
    onData: (data) => {
      cache.set(deferredQuery, data);
    },
  });

  const cachedData = cache.get(deferredQuery);

  const html = cachedData ? cachedData : data;
  const result = parseHtml(html ?? "");
  const hasData = !!result?.length;

  return (
    <List isShowingDetail={hasData} isLoading={isLoading} throttle onSearchTextChange={setQuery}>
      {!hasData && !query && <List.EmptyView icon={{ source: "../assets/oxford.png" }} title="Type to begin search" />}

      {!!hasData && (
        <>
          {result.map(({ type, collocationGroup }) => (
            <List.Section key={type} title={type}>
              {collocationGroup.map((group) => (
                <ListItem key={group.id} group={group} type={type} />
              ))}
            </List.Section>
          ))}
        </>
      )}
    </List>
  );
}

function ListItem({ group, type }: { group: Collocation; type: string }) {
  return (
    <List.Item
      title={remapType(group.type)}
      accessories={[{ tag: "teste" }]}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Type" text={type} />
              {group.definition && <List.Item.Detail.Metadata.Label title="Definition" text={group.definition} />}
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.TagList title="Collocations">
                {group.collocations.map((collocation, index) => (
                  // We can use index as key here i think, the order of the data will never change
                  <List.Item.Detail.Metadata.TagList.Item key={index} text={collocation} />
                ))}
              </List.Item.Detail.Metadata.TagList>
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}
