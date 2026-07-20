Received: from smtp.kernel.org (aws-us-west-2-korg-mail-1.web.codeaurora.org [10.30.226.201])
	(using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits))
	(No client certificate requested)
	by smtp.subspace.kernel.org (Postfix) with ESMTPS id 2C394383C66;
	Sun, 19 Jul 2026 11:51:13 +0000 (UTC)
Authentication-Results: smtp.subspace.kernel.org; arc=none smtp.client-ip=10.30.226.201
ARC-Seal:i=1; a=rsa-sha256; d=subspace.kernel.org; s=arc-20240116;
	t=1784461874; cv=none; b=HVbznCOabUNkGq3t+ovB035D7/0TuHU3WHkrn8kvqNVtpvNxA0AvSBNQpo9hGXolNY+CvwARgXAjfv6svgS5Sb0B7cMy4IZyQFZ5+ykc8rK9sFK3AwYFhPR/hlEVDDnOhEgWZ0YAB73mXNKNJFICKfZiIQaNTEplYYAi5zhfF+I=
ARC-Message-Signature:i=1; a=rsa-sha256; d=subspace.kernel.org;
	s=arc-20240116; t=1784461874; c=relaxed/simple;
	bh=NH3oBXw92CbGPFLrybesXiSZiX5ttYhNIw0Bo5XZuYA=;
	h=From:Subject:Date:Message-Id:MIME-Version:Content-Type:To:Cc; b=kJ3MW3opzxCf4ez0JdtRRC601M76wN6w5Yl5i+v6x22Gbf4XDeJhGX0gCrNqfGdauLkQwhj4Bol6n0ii/pcAqZsVbK4GxqgL1tv3kk+t35F36SVyANDQsL82gRfu5oAyxt5o8cCycJ3sU+xj4QKneColFrKcYKPwSRCYhjC8EiI=
ARC-Authentication-Results:i=1; smtp.subspace.kernel.org; dkim=pass (2048-bit key) header.d=kernel.org header.i=@kernel.org header.b=CQvx8LZR; arc=none smtp.client-ip=10.30.226.201
Authentication-Results: smtp.subspace.kernel.org;
	dkim=pass (2048-bit key) header.d=kernel.org header.i=@kernel.org header.b="CQvx8LZR"
Received: by smtp.kernel.org (Postfix) with ESMTPS id A9A38C19425;
	Sun, 19 Jul 2026 11:51:13 +0000 (UTC)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=kernel.org;
	s=k20201202; t=1784461873;
	bh=NH3oBXw92CbGPFLrybesXiSZiX5ttYhNIw0Bo5XZuYA=;
	h=From:Subject:Date:To:Cc:Reply-To:From;
	b=CQvx8LZRqJDYjn6/yEtRoLud/PDA8WdyxWsZfX+AOGEB4szxKiYpipSpg1fQiWB/X
	 oXN2BOwONOD9OwDZCDbxAD8sT2TvIR8teiAJMBjpeevIMFHbcSKqaC5JhaBHcH9/4C
	 klhg4UEUiDFzxVs1sHsUUdz4sUTnmOO7m23zlGKbiPr87QdKYk+yRj3Yu06BAJTTPf
	 Jda9RqcQ8RLtEjo8860vgfW8JRWnIBKniKh4KEOUmgD3Wg0Q+zfE00oW2fL2tMt/Gq
	 lCa6Uw3cYs09HeJ8T2lo8++8y6+e2NLUXZIDZumY8yVHJ/T/T9prqEnkSInTeP5kEc
	 gUY8yWdhJJabA==
Received: from aws-us-west-2-korg-lkml-1.web.codeaurora.org (localhost.localdomain [127.0.0.1])
	by smtp.lore.kernel.org (Postfix) with ESMTP id 81968C44521;
	Sun, 19 Jul 2026 11:51:13 +0000 (UTC)
From: Jahnavi MN via B4 Relay <devnull+jahnavimn.google.com@kernel.org>
Subject: [PATCH v3 0/2] rust_binder: Update bitmaps to use
 kernel::impl_flags!
Date: Sun, 19 Jul 2026 11:51:08 +0000
Message-Id: <20260719-b4-rust_binder_impl_flags-v3-0-f8d0b3ea1b87@google.com>
Precedence: bulk
X-Mailing-List: rust-for-linux@vger.kernel.org
List-Id: <rust-for-linux.vger.kernel.org>
List-Subscribe: <mailto:rust-for-linux+subscribe@vger.kernel.org>
List-Unsubscribe: <mailto:rust-for-linux+unsubscribe@vger.kernel.org>
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit
X-B4-Tracking: v=1; b=H4sIACy6XGoC/33NSwqDMBCA4atI1k0xidHaVe9RiuQxiQE1klhpE
 e/eKBTajct/hvlmQRGCg4iu2YICzC46P6RgpwypVgwWsNOpEc1pmVeEY1ng8IxTI92gITSuH7v
 GdMJGDJzJAqQSF65Ruh8DGPfa7fsjdevi5MN7fzWTbfpVywN1JjhPa5oTzQzhkt2s97aDs/I92
 tiZ/lL1EUUTVQmuQWojWK3+qHVdP8AW/xwOAQAA
X-Change-ID: 20260715-b4-rust_binder_impl_flags-e53b4ebca85d
To: Greg Kroah-Hartman <gregkh@linuxfoundation.org>, 
 =?utf-8?q?Arve_Hj=C3=B8nnev=C3=A5g?= <arve@android.com>, 
 Todd Kjos <tkjos@android.com>, Christian Brauner <brauner@kernel.org>, 
 Carlos Llamas <cmllamas@google.com>, Alice Ryhl <aliceryhl@google.com>, 
 Benno Lossin <lossin@kernel.org>, Gary Guo <gary@garyguo.net>
Cc: linux-kernel@vger.kernel.org, rust-for-linux@vger.kernel.org, 
 Jahnavi MN <jahnavimn@google.com>
X-Mailer: b4 0.14.3
X-Developer-Signature: v=1; a=ed25519-sha256; t=1784461872; l=2086;
 i=jahnavimn@google.com; s=20260702; h=from:subject:message-id;
 bh=NH3oBXw92CbGPFLrybesXiSZiX5ttYhNIw0Bo5XZuYA=;
 b=aG8RbXd+w+vqO72ZJr8tkZNAmFk+zeT3g3jwSD1SwKjNevKhRZJ08yH+o3r2AFq2dtRt09f9L
 0T9t+Gv9VowD31i0vdH3CSWwH5k8T5jp8RlT+xCHdR5Q1oqJHFFKm01
X-Developer-Key: i=jahnavimn@google.com; a=ed25519;
 pk=9aLfw3FepTOJwTS7jRXm7pDH87eBeZMXBPrqwU0//RE=
X-Endpoint-Received: by B4 Relay for jahnavimn@google.com/20260702 with
 auth_id=849
X-Original-From: Jahnavi MN <jahnavimn@google.com>
Reply-To: jahnavimn@google.com

In the current Rust Binder driver, internal state variables (thread
looper states, deferred work, and transaction configurations) are
represented as raw integers and manipulated using manual bitwise
operations.

This approach lacks type safety. Because the compiler treats all
integers identically, it is possible to pass a thread looper flag
into a function expecting a transaction flag without triggering
compile-time warnings. These cross-contamination errors compile
cleanly but can cause runtime bugs or undefined behavior.

This patch series resolves this issue by migrating these raw integer
bitmaps (`defer_work`, `looper_flags`, `flags`) to strongly-typed
bitmasks using the `kernel::impl_flags!` macro. Functions now accept
specific, distinct types rather than generic integers, preventing
flags from being mixed up. This transition also replaces manual
bitwise arithmetic with readable, safe methods.

Based on top of:
https://git.kernel.org/pub/scm/linux/kernel/git/gregkh/char-misc.git

Signed-off-by: Jahnavi MN <jahnavimn@google.com>
---
Changes in v3:
- Rewrite commit messages to explain the motivation for the changes.
- Link to v2: https://lore.kernel.org/r/20260719-b4-rust_binder_impl_flags-v2-0-7a5debdfa39c@google.com

Changes in v2:
- Drop Patch 1 (defer_work) as it was merged into char-misc-testing.
- Rebase remaining two patches on latest char-misc-testing tree.
- Link to v1: https://lore.kernel.org/r/20260716-b4-rust_binder_impl_flags-v1-0-b4201d3f15b3@google.com

---
Jahnavi MN (2):
      rust_binder: Update looper_flags bitmaps to use kernel::impl_flags!
      rust_binder: Update transaction flags to use kernel::impl_flags!

 drivers/android/binder/thread.rs      | 68 ++++++++++++++++++++---------------
 drivers/android/binder/transaction.rs | 58 ++++++++++++++++++++++--------
 2 files changed, 83 insertions(+), 43 deletions(-)
---
base-commit: 2cedf2272f1bb42471e646868ac572cc5752bd91
change-id: 20260715-b4-rust_binder_impl_flags-e53b4ebca85d

Best regards,
-- 
Jahnavi MN <jahnavimn@google.com>


