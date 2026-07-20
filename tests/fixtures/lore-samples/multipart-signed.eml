Received: from mout01.posteo.de (mout01.posteo.de [185.67.36.65])
	(using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits))
	(No client certificate requested)
	by smtp.subspace.kernel.org (Postfix) with ESMTPS id D82A715FA81
	for <rust-for-linux@vger.kernel.org>; Sun, 19 Jul 2026 16:09:29 +0000 (UTC)
Authentication-Results: smtp.subspace.kernel.org; arc=none smtp.client-ip=185.67.36.65
ARC-Seal:i=1; a=rsa-sha256; d=subspace.kernel.org; s=arc-20240116;
	t=1784477371; cv=none; b=f+slSah9zGwiBVCT47JFVdRyulZrjtCMvPZZZhACTHlMbOoeqhPVLJDodQghLfD6ATYiR20AarQWdfpD2WCl46iA9vFq0+V/nAvYVNsJZ6VOxMNAKltv13o+kDxZA2oE4hz+J7TsWdh4Wyxokbpde/rewl2JtfeB4d1FoinU6d4=
ARC-Message-Signature:i=1; a=rsa-sha256; d=subspace.kernel.org;
	s=arc-20240116; t=1784477371; c=relaxed/simple;
	bh=5j0+Q+8f9tUfn8r5/ID+yQmL1h8HTn3VdOrsDpaCmw8=;
	h=Message-ID:Subject:From:To:Cc:Date:In-Reply-To:References:
	 Content-Type:MIME-Version; b=nsxHZWj/TXIO0hf1MYkPSIwYkzr6d+588VqAAWAT3cYsH0nrPRq8t8aZIeFJ4GykdGqykoRcP0q/b2rRSbsdWthFvCTuU3LmeFhqIZbk3WSbSRwgxgmOO6PKGw/bue6s0mOfmPF8TgTrtrtgapi8m86zjLxR0gtIYXbM+2Q3bk4=
ARC-Authentication-Results:i=1; smtp.subspace.kernel.org; dmarc=pass (p=none dis=none) header.from=posteo.de; spf=pass smtp.mailfrom=posteo.de; dkim=pass (2048-bit key) header.d=posteo.de header.i=@posteo.de header.b=Ls3PK8ha; arc=none smtp.client-ip=185.67.36.65
Authentication-Results: smtp.subspace.kernel.org; dmarc=pass (p=none dis=none) header.from=posteo.de
Authentication-Results: smtp.subspace.kernel.org; spf=pass smtp.mailfrom=posteo.de
Authentication-Results: smtp.subspace.kernel.org;
	dkim=pass (2048-bit key) header.d=posteo.de header.i=@posteo.de header.b="Ls3PK8ha"
Received: from submission (posteo.de [185.67.36.169]) 
	by mout01.posteo.de (Postfix) with ESMTPS id E8F88240027
	for <rust-for-linux@vger.kernel.org>; Sun, 19 Jul 2026 18:09:21 +0200 (CEST)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=posteo.de;
	s=1984.8680eb; t=1784477361;
	bh=5j0+Q+8f9tUfn8r5/ID+yQmL1h8HTn3VdOrsDpaCmw8=;
	h=Message-ID:Subject:From:To:Cc:Date:Autocrypt:Content-Type:
	 MIME-Version:OpenPGP:From;
	b=Ls3PK8ha/BcdA5Ioo8nsrQMOOtvxWxMvwBl9mpuUT6/Hol3atBR/F5lfiv89/TAAk
	 YvB7o/8wu+COL1YxPWnbaC+rNQCQaxlhZAmhNDfGCh6OsfFXkKfqBC3oQWgboD4RcU
	 nH8DBWacyGHCo7lQ3Rbyf/EkiaclGt9+g9ayIRMH6MYfF2veReBpMpdL/XbGc8TLYc
	 daqfQVbDMFxafJUA3BEP3CumVob39IYJihqdu1o3d5iFdZdrIwwhyuD6OZGqLfAEoj
	 /801vf1lmtl+TkO6ltyVoldk8mQ7lT9QCoBP9H35tna0ujIDbUS7SOmhUMsC21MQAB
	 ieHUhIwFqZVOQ==
Received: from customer (localhost [127.0.0.1])
	by submission (posteo.de) with ESMTPSA id 4h37rH238Kz6txq;
	Sun, 19 Jul 2026 18:09:19 +0200 (CEST)
Message-ID: <128bd2f0b3369f2eff43357483565a74700cd5c4.camel@posteo.de>
Subject: Re: [PATCH v2 0/4] rust: serdev: trivial fixes
From: Markus Probst <markus.probst@posteo.de>
To: Danilo Krummrich <dakr@kernel.org>
Cc: Greg Kroah-Hartman <gregkh@linuxfoundation.org>, Miguel Ojeda	
 <ojeda@kernel.org>, Boqun Feng <boqun@kernel.org>, Gary Guo
 <gary@garyguo.net>,  =?ISO-8859-1?Q?Bj=F6rn?= Roy Baron	
 <bjorn3_gh@protonmail.com>, Benno Lossin <lossin@kernel.org>, Andreas
 Hindborg	 <a.hindborg@kernel.org>, Alice Ryhl <aliceryhl@google.com>,
 Trevor Gross	 <tmgross@umich.edu>, Daniel Almeida
 <daniel.almeida@collabora.com>, Tamir Duberstein <tamird@kernel.org>,
 Alexandre Courbot <acourbot@nvidia.com>, Onur =?ISO-8859-1?Q?=D6zkan?=	
 <work@onurozkan.dev>, linux-serial@vger.kernel.org, 
	rust-for-linux@vger.kernel.org, linux-kernel@vger.kernel.org, kernel test
 robot	 <lkp@intel.com>
Date: Sun, 19 Jul 2026 16:09:21 +0000
In-Reply-To: <DK1R9VZND2NS.36X0BL0F957OI@kernel.org>
References: <20260718-rust_serdev_fixes-v2-0-e5214e03de13@posteo.de>
	 <DK1R9VZND2NS.36X0BL0F957OI@kernel.org>
Autocrypt: addr=markus.probst@posteo.de; prefer-encrypt=mutual;
 keydata=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
 jfGillcaQOqFZ3WwVqyzG1BUfTow==
Content-Type: multipart/signed; micalg="pgp-sha256";
	protocol="application/pgp-signature"; boundary="=-BiYm2L4aK4rtF4SVsgXx"
Precedence: bulk
X-Mailing-List: rust-for-linux@vger.kernel.org
List-Id: <rust-for-linux.vger.kernel.org>
List-Subscribe: <mailto:rust-for-linux+subscribe@vger.kernel.org>
List-Unsubscribe: <mailto:rust-for-linux+unsubscribe@vger.kernel.org>
MIME-Version: 1.0
OpenPGP: url=https://posteo.de/keys/markus.probst@posteo.de.asc; preference=encrypt


--=-BiYm2L4aK4rtF4SVsgXx
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

On Sat, 2026-07-18 at 16:10 +0200, Danilo Krummrich wrote:
> On Sat Jul 18, 2026 at 2:47 PM CEST, Markus Probst wrote:
> > Those are small fixes discovered by the kernel test robot and Gary Guo
> > after the serdev rust abstraction have already been merged.
> >=20
> > This includes
> > - a fix for a documentation typo
> > - adding missing `#[inline]` attributes
> > - a small structual change for timeout
>=20
> Thanks for the quick follow-up, the patches were only in the -testing bra=
nch, so
> I dropped them from the queue.
>=20
> Can you please integrate those changes into the original patches and rese=
nd?
>=20
> Thanks,
> Danilo

Hi,

The patches have been integrated into
https://lore.kernel.org/rust-for-linux/20260718-rust_serdev-v16-0-5809384d2=
e1b@posteo.de
.

As they haven't been picked up again yet, I assume you want to wait to
allow for comments to be written.

Thanks
- Markus Probst

--=-BiYm2L4aK4rtF4SVsgXx
Content-Type: application/pgp-signature; name="signature.asc"
Content-Description: This is a digitally signed message part

-----BEGIN PGP SIGNATURE-----

iQJPBAABCAA5FiEEgnQYxPSsWOdyMMRzNHYf+OetQ9IFAmpc9pkbFIAAAAAABAAO
bWFudTIsMi41KzEuMTIsMiwyAAoJEDR2H/jnrUPSz5kQAKOBVC0vSgi6aDXWZO+K
dr1Ug/Ipswr9SeiNtXQbxqTtl/Y3wWZFLdvDKkNDAMbnT62GaXsaqjkIFknU0Z6x
YPlVDR1D51MMclaLp7Ls7CDGf/xtWjDg7JqdnLg0pCqXVX6xmG9RKWQ3lmJJlA17
bJdgFfZsPz04HblKvcrynKRWuf38Oi+RlQMk8j0ypvmWnk3udemHH+NA08NXx3LK
JTVsMQJBd72+99HOGKp5xiacRQol9lRqd9tSFFWF9eYaMviD/1wQgnSqPrQ3T+nx
5JauBQr/WSteBCzC+Kzv0XIxzLKTKuajh+xfivklU2BzND89YEZUc/Ok7tGxwpdR
8UFzFFdITc1jrVJaVM+GfKhJshGRIKfM2NR6dI4DbSptXC0aOYS8GRbZx+OUgHuR
rEPmg7tX1ebSR4Ftz/kRR5jlYVRUeuDsQXOKyOkU6yryZqxRxzNPLDYESanS0kjD
KIQG7zfma0k8B5KGmhlkKQXgcj0D63pCTjMTKTGurcaAR9QCeV41bNo1qn136B/p
VUu+KwuHEXedZTQYbCnTENHt+l0oTbiCayLx9vaeSeNFfcUlqLzcVMrOGCGtmZcV
NEh3t5rufL+xZiLiKnDV64o4d2Z8BwCy+GKniyylmWSDyJ4AT0NB6pf2tEiQZYbq
w0it182pWV1ljoIe9VuK+vnh
=cnZu
-----END PGP SIGNATURE-----

--=-BiYm2L4aK4rtF4SVsgXx--
