import { Button } from "@/components/ui/button";
import { Gear, Verified, NotVerified } from "@/components/svg";
import FormInput from "@/components/reusables/form-fields/form-input";
import { SubheadingDivider } from "../reusables/form-fields/sub-heading";
import { PacsConfigurationSummaryProps } from "~/types/device";

export function PacsConfigurationSummary({
  connectionStatus,
  onConfigure,
}: Readonly<PacsConfigurationSummaryProps>) {

  return (
      <div className="space-y-4">
        <SubheadingDivider>Device Integration</SubheadingDivider>
        <p className="text-md font-semibold text-header-secondary leading-tight capitalize">
        System Integration
        </p>
        {/* PACS Configuration Card */}
        <div className="space-y-2 bg-background-inner pl-2 pr-3 pt-2 pb-5 flex justify-between gap-2 rounded-lg shadow-sm">
          <div className="flex flex-col justify-between w-full gap-2">
            <p className="text-md font-semibold text-header-secondary leading-tight capitalize">
              PACS Configuration
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-end">
                <FormInput
                  className="w-[430px] cursor-not-allowed disabled:opacity-100 disabled:text-text-primary"
                  name="aeTitle"
                  label="Name"
                  placeholder="Connection Name"
                  vertical
                  disabled
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onConfigure}
                  className="flex items-center justify-center gap-2 !px-[22px] !py-[10px] bg-light-100 rounded-sm"
                >
                  <Gear className="h-4 w-4"/>
                  Configure
                </Button>
              </div>

              <div className="flex justify-between items-center w-full max-w-[430px]">
                <p className="text-sm font-medium text-header-secondary capitalize">
                  Connection Status
                </p>
                {connectionStatus ? (
                  <div className="flex items-center gap-2">
                    <Verified className="h-4 w-4 text-neutral-500" />
                    <p className="text-[10px] font-normal italic text-neutral-500">
                      Verified
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <NotVerified className="h-4 w-4 text-neutral-500" />
                    <p className="text-[10px] font-normal italic text-neutral-400">
                      not verified
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}