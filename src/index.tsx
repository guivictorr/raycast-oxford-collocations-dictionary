import { List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";

import { Collocation, parseHtml } from "./parseHtml";

export default function Command() {
  const [query, setQuery] = useState("");
  const url = `https://www.freecollocation.com/search?word=${query}`;
  const { data, isLoading } = useFetch<string>(url, {
    execute: !!query,
  });

  const html = data || "";
  const result = parseHtml(html);

  return (
    <List isShowingDetail={!!html} isLoading={isLoading} throttle onSearchTextChange={setQuery}>
      {!html && <List.EmptyView icon={{ source: "../assets/oxford.png" }} title="Type to begin search" />}

      {!!html && (
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
      title={group.type}
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
