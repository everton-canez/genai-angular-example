import { JsonPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  resource,
  signal,
} from "@angular/core";

@Component({
  selector: "app-root",
  imports: [JsonPipe],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly url = "http://localhost:4000/api/stream-response";
  readonly decoder = new TextDecoder();

  // readonly characters = resource({
  //   loader: async ({ abortSignal }) => {
  //     const data = signal<{ value: string } | { error: unknown }>({
  //       value: "",
  //     });

  //     const response = await fetch(this.url, { signal: abortSignal });
  //     if (!response.body) {
  //       return;
  //     }
  //     for await (const chunk of response.body) {
  //       const chunkText = this.decoder.decode(chunk);
  //       data.update((prev) => {
  //         if ("value" in prev) {
  //           return { value: `${prev.value} ${chunkText}` };
  //         } else {
  //           return { error: chunkText };
  //         }
  //       });
  //     }
  //     return data;
  //   },
  // });

  characters = resource({
    loader: async () => {
      const data = signal<{ value: string } | { error: unknown }>({
        value: "",
      });

      fetch(this.url).then(async (response) => {
        if (!response.body) return;

        for await (const chunk of response.body) {
          const chunkText = this.decoder.decode(chunk);
          data.update((prev) => {
            if ("value" in prev) {
              console.log({ value: `${prev.value} ${chunkText}` });
              return { value: `${prev.value} ${chunkText}` };
            } else {
              return { error: chunkText };
            }
          });

          console.log(data());
        }
      });

      return data;
    },
  });
}
