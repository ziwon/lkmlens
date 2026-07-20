Received: from chaosmail.tech (chaosmail.tech [77.81.229.115])
	(using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits))
	(No client certificate requested)
	by smtp.subspace.kernel.org (Postfix) with ESMTPS id B708A3B8412;
	Mon, 20 Jul 2026 07:23:09 +0000 (UTC)
Authentication-Results: smtp.subspace.kernel.org; arc=none smtp.client-ip=77.81.229.115
ARC-Seal:i=1; a=rsa-sha256; d=subspace.kernel.org; s=arc-20240116;
	t=1784532195; cv=none; b=jCNPWAbc7OUISm86bUCGHqqwr2tSVRk4eTAzI4Cmc2jBUOZdjNngkHOlrnjFBHvCbwwxEZDKNOzvsnTDJQJduiR408EApCdY+GITXJFOCVI9DuwPF6pEV5S4yiVCo0GflWxWzm4bt9iFkLSAdSr1LEpA350x1LwHr5evIh/q6EA=
ARC-Message-Signature:i=1; a=rsa-sha256; d=subspace.kernel.org;
	s=arc-20240116; t=1784532195; c=relaxed/simple;
	bh=0SiPbcO8RTxkJ2sgrJEH8OIt4uYhOTDri5NzPEOlVGc=;
	h=From:Date:Subject:MIME-Version:Content-Type:Message-Id:To:Cc; b=n0w9kO3QeQQqRvBtE0qmkkhu08lQoeAxTKSHOvdadIz8MTZYJrcODNgBiqVkEO7JHKBp4JFclBQkWmxzz63i+eCSZlHJkPg6f9Z/mkt2EpvO3JDmwYFhCKdq38GF9txCxgUbstjY5H3QUb0qVKp4EqsjbsOTJt+cfUK3zsToQyE=
ARC-Authentication-Results:i=1; smtp.subspace.kernel.org; dmarc=pass (p=reject dis=none) header.from=chaosmail.tech; spf=pass smtp.mailfrom=chaosmail.tech; dkim=pass (1024-bit key) header.d=chaosmail.tech header.i=@chaosmail.tech header.b=MqoGSEa+; arc=none smtp.client-ip=77.81.229.115
Authentication-Results: smtp.subspace.kernel.org; dmarc=pass (p=reject dis=none) header.from=chaosmail.tech
Authentication-Results: smtp.subspace.kernel.org; spf=pass smtp.mailfrom=chaosmail.tech
Authentication-Results: smtp.subspace.kernel.org;
	dkim=pass (1024-bit key) header.d=chaosmail.tech header.i=@chaosmail.tech header.b="MqoGSEa+"
Received: by chaosmail.tech (Postfix) id 402701C8676;
	Mon, 20 Jul 2026 07:13:22 +0000 (UTC)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=chaosmail.tech;
	s=mail; t=1784531603;
	h=from:from:reply-to:subject:subject:date:date:message-id:message-id:
	 to:to:cc:cc:mime-version:mime-version:content-type:content-type:
	 content-transfer-encoding:content-transfer-encoding;
	bh=iTrVRI86i7nzPnQemQQuLNohM7hyMo7ba924tYiRDQ0=;
	b=MqoGSEa+4Uecz5+qucuydSbUqys02V0KKL8MfECSXaSo6/pUbe43RkQ4phOhLEfIZfQTan
	BpYRRMCwETxq7yZMOJ8I1U5qKvisx5+3FYFe226Rdu7T7An6PvpsfKQ/Wdx1rCP7XiuV1w
	V8+p9ER2gE/8eQJDeYnmSpePE10hQ50=
From: Sasha Finkelstein <k@chaosmail.tech>
Date: Mon, 20 Jul 2026 09:13:20 +0200
Subject: [PATCH RESEND v3] Fail the build on RUST=y and RUST_IS_AVAILABLE=n
Precedence: bulk
X-Mailing-List: rust-for-linux@vger.kernel.org
List-Id: <rust-for-linux.vger.kernel.org>
List-Subscribe: <mailto:rust-for-linux+subscribe@vger.kernel.org>
List-Unsubscribe: <mailto:rust-for-linux+unsubscribe@vger.kernel.org>
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit
Message-Id: <20260720-evolve-to-crab-v3-1-3f60344f4f6e@chaosmail.tech>
To: Alice Ryhl <aliceryhl@google.com>, 
 Andreas Hindborg <a.hindborg@kernel.org>, Benno Lossin <lossin@kernel.org>, 
 =?utf-8?q?Bj=C3=B6rn_Roy_Baron?= <bjorn3_gh@protonmail.com>, 
 Boqun Feng <boqun@kernel.org>, Danilo Krummrich <dakr@kernel.org>, 
 Gary Guo <gary@garyguo.net>, Jonathan Corbet <corbet@lwn.net>, 
 Miguel Ojeda <ojeda@kernel.org>, Shuah Khan <skhan@linuxfoundation.org>, 
 Trevor Gross <tmgross@umich.edu>
Cc: Neal Gompa <neal@gompa.dev>, linux-doc@vger.kernel.org, 
 linux-kernel@vger.kernel.org, rust-for-linux@vger.kernel.org, 
 Sasha Finkelstein <k@chaosmail.tech>
X-Developer-Signature: v=1; a=ed25519-sha256; t=1784531602; l=2582;
 i=k@chaosmail.tech; s=20241124; h=from:subject:message-id;
 bh=0SiPbcO8RTxkJ2sgrJEH8OIt4uYhOTDri5NzPEOlVGc=;
 b=P5bt+u1s7Zyu1jTMrcUuloWRyxOJh2TyJ+SUc9Jh4tcdagA+Fy9zD4wGvlXBuU58stQ2e3BGk
 xmU6S/WfVxKACf6NxnD4lduo0LTQaZnSaKVN6jHfLPfNfKHwvAdht6F
X-Developer-Key: i=k@chaosmail.tech; a=ed25519;
 pk=aSkp1PdZ+eF4jpMO6oLvz/YfT5XkBUneWwyhQrOgmsU=

The current approach of silently disabling all rust drivers if the
toolchain is missing results in users that try to compile their own
kernels getting a "successful" build and then being confused about where
did their drivers go. In comparison, missing openssl results in a build
failure, not a disappearance of everything that depends on it.

This also means that allyesconfig will depend on rust, but since the
rust experiment concluded with "rust is here to stay", i believe that
allyesconfig should be building rust drivers too.

Reviewed-by: Gary Guo <gary@garyguo.net>
Reviewed-by: Andreas Hindborg <a.hindborg@kernel.org>
Reviewed-by: Neal Gompa <neal@gompa.dev>
Signed-off-by: Sasha Finkelstein <k@chaosmail.tech>
---
Changes in v3:
- Collect r-b tags
- Rebase on 7.2
- Link to v2: https://patch.msgid.link/20260521-evolve-to-crab-v2-1-c18e0e98fc54@chaosmail.tech

Changes in v2:
- No longer a RFC, let's make it happen.
- Update the docs.
- Link to v1: https://patch.msgid.link/20260510-evolve-to-crab-v1-1-208df84e67be@chaosmail.tech
---
 Documentation/rust/quick-start.rst | 6 +++---
 init/Kconfig                       | 1 -
 2 files changed, 3 insertions(+), 4 deletions(-)

diff --git a/Documentation/rust/quick-start.rst b/Documentation/rust/quick-start.rst
index a6ec3fa94d33..764c81d0dd59 100644
--- a/Documentation/rust/quick-start.rst
+++ b/Documentation/rust/quick-start.rst
@@ -321,9 +321,9 @@ Configuration
 -------------
 
 ``Rust support`` (``CONFIG_RUST``) needs to be enabled in the ``General setup``
-menu. The option is only shown if a suitable Rust toolchain is found (see
-above), as long as the other requirements are met. In turn, this will make
-visible the rest of options that depend on Rust.
+menu. In turn, this will make visible the rest of options that depend on Rust.
+You can check the value of ``RUST_IS_AVAILABLE`` to determine if your toolchain
+is configured correctly.
 
 Afterwards, go to::
 
diff --git a/init/Kconfig b/init/Kconfig
index 5230d4879b1c..0eca3dfd9349 100644
--- a/init/Kconfig
+++ b/init/Kconfig
@@ -2207,7 +2207,6 @@ config PROFILING
 config RUST
 	bool "Rust support"
 	depends on HAVE_RUST
-	depends on RUST_IS_AVAILABLE
 	select EXTENDED_MODVERSIONS if MODVERSIONS
 	depends on !MODVERSIONS || GENDWARFKSYMS
 	depends on !GCC_PLUGIN_RANDSTRUCT

---
base-commit: dc59e4fea9d83f03bad6bddf3fa2e52491777482
change-id: 20260510-evolve-to-crab-8cba1768dcd5

Best regards,
--
Sasha Finkelstein <k@chaosmail.tech>
-- 
Sasha Finkelstein <k@chaosmail.tech>

