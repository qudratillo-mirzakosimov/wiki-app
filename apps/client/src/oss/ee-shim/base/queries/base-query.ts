// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
export { useDisabledMutation as useConvertPageToBaseMutation } from "@/ee/_unavailable";

export function useBaseQuery(..._args: any[]): any {
  return { data: undefined, isLoading: false, isError: true };
}
