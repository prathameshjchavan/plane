import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

// mobx
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
// headless ui
import { Dialog, Transition } from "@headlessui/react";
// hooks
import useUser from "hooks/use-user";
// components
import { FullScreenPeekView, SidePeekView } from "components/issues";
// types
import { IIssue } from "types";

type Props = {
  handleMutation: () => void;
  projectId: string;
  readOnly: boolean;
  workspaceSlug: string;
};

export type TPeekOverviewModes = "side" | "modal" | "full";

export const IssuePeekOverview: React.FC<Props> = observer(
  ({ handleMutation, projectId, readOnly, workspaceSlug }) => {
    const [isSidePeekOpen, setIsSidePeekOpen] = useState(false);
    const [isModalPeekOpen, setIsModalPeekOpen] = useState(false);
    const [peekOverviewMode, setPeekOverviewMode] = useState<TPeekOverviewModes>("side");

    const router = useRouter();
    const { peekIssue } = router.query;

    const { issues: issuesStore } = useMobxStore();
    const { deleteIssue, getIssueById, issues, updateIssue } = issuesStore;

    const issue = issues[peekIssue?.toString() ?? ""];

    const { user } = useUser();

    const handleClose = () => {
      const { query } = router;
      delete query.peekIssue;

      router.push({
        pathname: router.pathname,
        query: { ...query },
      });
    };

    const handleUpdateIssue = async (formData: Partial<IIssue>) => {
      if (!issue || !user) return;

      await updateIssue(workspaceSlug, projectId, issue.id, formData, user);
      handleMutation();
    };

    const handleDeleteIssue = async () => {
      if (!issue || !user) return;

      await deleteIssue(workspaceSlug, projectId, issue.id, user);
      handleMutation();

      handleClose();
    };

    useEffect(() => {
      if (!peekIssue) return;

      getIssueById(workspaceSlug, projectId, peekIssue.toString());
    }, [getIssueById, peekIssue, projectId, workspaceSlug]);

    useEffect(() => {
      if (peekIssue) {
        if (peekOverviewMode === "side") {
          setIsSidePeekOpen(true);
          setIsModalPeekOpen(false);
        } else {
          setIsModalPeekOpen(true);
          setIsSidePeekOpen(false);
        }
      } else {
        console.log("Triggered");
        setIsSidePeekOpen(false);
        setIsModalPeekOpen(false);
      }
    }, [peekIssue, peekOverviewMode]);

    return (
      <>
        <Transition.Root appear show={isSidePeekOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-20" onClose={handleClose}>
            <div className="fixed inset-0 z-20 overflow-y-auto">
              <div className="relative h-full w-full">
                <Transition.Child
                  as={React.Fragment}
                  enter="transition-transform duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition-transform duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="absolute z-20 bg-custom-background-100 top-0 right-0 h-full w-1/2 shadow-custom-shadow-md">
                    <SidePeekView
                      handleClose={handleClose}
                      handleDeleteIssue={handleDeleteIssue}
                      handleUpdateIssue={handleUpdateIssue}
                      issue={issue}
                      mode={peekOverviewMode}
                      readOnly={readOnly}
                      setMode={(mode) => setPeekOverviewMode(mode)}
                      workspaceSlug={workspaceSlug}
                    />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root appear show={isModalPeekOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-20" onClose={handleClose}>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-custom-backdrop bg-opacity-50 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-20 overflow-y-auto">
              <div className="relative h-full w-full">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Panel
                    className={`absolute z-20 bg-custom-background-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-custom-shadow-xl transition-all duration-300 ${
                      peekOverviewMode === "modal" ? "h-[70%] w-3/5" : "h-[95%] w-[95%]"
                    }`}
                  >
                    {peekOverviewMode === "modal" && (
                      <SidePeekView
                        handleClose={handleClose}
                        handleDeleteIssue={handleDeleteIssue}
                        handleUpdateIssue={handleUpdateIssue}
                        issue={issue}
                        mode={peekOverviewMode}
                        readOnly={readOnly}
                        setMode={(mode) => setPeekOverviewMode(mode)}
                        workspaceSlug={workspaceSlug}
                      />
                    )}
                    {peekOverviewMode === "full" && (
                      <FullScreenPeekView
                        handleClose={handleClose}
                        handleDeleteIssue={handleDeleteIssue}
                        handleUpdateIssue={handleUpdateIssue}
                        issue={issue}
                        mode={peekOverviewMode}
                        readOnly={readOnly}
                        setMode={(mode) => setPeekOverviewMode(mode)}
                        workspaceSlug={workspaceSlug}
                      />
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </>
    );
  }
);
