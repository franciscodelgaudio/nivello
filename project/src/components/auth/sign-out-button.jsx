import { signOutAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignOutButton({ className, label = "Sair" }) {
    return (
        <form action={signOutAction}>
            <SubmitButton variant="outline" className={className}>
                {label}
            </SubmitButton>
        </form>
    );
}
