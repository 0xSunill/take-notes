use anchor_lang::prelude::*;

declare_id!("A1mqt2qGaBxy7yz3oX2nrxoovG9CgshHQSzyfEVdEZUg");

#[program]
pub mod notes_app {
    use super::*;

    pub fn create_note(
        ctx: Context<CreateNote>,
        title: String,
        message: String,
    ) -> Result<()> {
        let note = &mut ctx.accounts.note;
        note.owner = ctx.accounts.owner.key();
        note.title = title;
        note.message = message;
        Ok(())
    }

    pub fn update_note(
        ctx: Context<UpdateNote>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let note = &mut ctx.accounts.note;
        note.message = message;
        Ok(())
    }

    pub fn delete_note(
        _ctx: Context<DeleteNote>,
        _title: String,
    ) -> Result<()> {
        // Automatically closed via `close = owner`
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateNote<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        space = 8 + Note::INIT_SPACE,
        payer = owner
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateNote<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Note {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}
