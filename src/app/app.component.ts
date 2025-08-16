import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from "@angular/core";

type CharactersType = { value: string; error?: unknown };

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly url = "http://localhost:4000/api/stream-response";
  readonly decoder = new TextDecoder();
  readonly http = inject(HttpClient);

  characters = resource({
    stream: async () => {
      const chars = signal<CharactersType>({
        value: "",
      });
      fetch(this.url).then(async (response) => {
        if (!response.body) return;

        for await (const chunk of response.body) {
          const chunkText = this.decoder.decode(chunk);
          chars.update((prev): CharactersType => {
            if ("value" in prev) {
              return { value: `${prev.value} ${chunkText}` };
            } else {
              return { value: "", error: `${chunkText}` };
            }
          });

          // this.data.update((prev): any => {
          //   if ("value" in prev) {
          //     return { value: `${prev.value} ${chunkText}` };
          //   } else {
          //     return { error: chunkText };
          //   }
          // });
        }
      });

      return chars;
    },
  });

  //   readonly resource = rxResource({
  //   stream: () => {
  //     return this.http.get<any>(this.url).pipe(
  //       map(async (response) => {
  //         if (!response.body) return;
  //         for await (const chunk of response.body) {
  //           const chunkText = this.decoder.decode(chunk);

  //           this.data.update((prev) => {
  //             if ("value" in prev) {
  //               console.log({ value: `${prev.value} ${chunkText}` });
  //               return { value: `${prev.value} ${chunkText}` };
  //             } else {
  //               return { error: chunkText };
  //             }
  //           });
  //         },
  //       })
  //     );
  //   },

  //   defaultValue: undefined,
  // });
}
